import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Account } from "./models/account.schema";
import { Model, Types } from "mongoose";
import { ApiCredentials } from "telegram/client/auth";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { User } from "src/users/models/user.schema";
import { computeCheck } from "telegram/Password";
import { generateSecureUniqueID } from "src/utils/secureId";
import { AccountsStorage } from "./accounts.storage";
import { Dialog } from "telegram/tl/custom/dialog";
import { getEntityType, getTypedEntity, NormalizedDialog, normalizeDialog } from "src/utils/chatEntity";

@Injectable()
export class AccountsService {
  ApiConfig: ApiCredentials
  client: TelegramClient
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    private readonly storage: AccountsStorage
  ) {
    this.ApiConfig = {
      apiHash: process.env.API_HASH,
      apiId: Number(process.env.API_ID)
    }

    this.client = new TelegramClient(
      new StringSession(''),
      Number(process.env.API_ID),
      process.env.API_HASH, {}
    )
    this.client.connect()
      .then(() => {
        console.log('Client service started')
      })
  }


  async getChats(accountId: string,): Promise<NormalizedDialog[]> {
    try {
      const client = this.storage.getClient(accountId);
      if (!client) {
        throw new Error('Account not active')
      }
      const dialogs = await client.getDialogs({});

      const normalized = await Promise.all(
        dialogs.map((dialog: Dialog) => normalizeDialog(client, dialog))
      );

      return normalized.filter(Boolean) as NormalizedDialog[];
    } catch (error) {
      console.error('Error in getChats:', error);
      throw new HttpException(error.message, 500)
    }
  }


  async createAccount(accountName: string, session: string, user: User) {
    try {
      const client = new TelegramClient(
        new StringSession(session),
        Number(process.env.API_ID),
        process.env.API_HASH, {}
      )

      await client.connect()

      const accountInfo = await client.getMe()
      const createdAccount = await this.accountModel.create({
        name: accountName,
        sessionData: session,
        user: user._id,
        username: accountInfo.username,
        firstname: accountInfo.firstName,
        lastname: accountInfo.lastName,
        id: generateSecureUniqueID(),
        phone: accountInfo.phone
      })
      await this.storage.addClient(createdAccount.id, createdAccount.sessionData)
      return createdAccount
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Failed to create account')
    }
  }




  // async onModuleInit() {
  //   this.client = new TelegramClient(new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUJLG3zsBM0VU++N1TsN5lmpbI6pZwnBiNrATWkkj24oTRWEa5Th1a+ENXiAuKYsCJMfo5KEzTeV8PSNjbCzWFo6v58+lM00zhdep7994JE4ab8NZpnJ71B+Oy84cYJZJKtZ92BuqueV3mjNLtrkOMCdlQzZK579wwbqTsa/HMwwwrAM2vdKf+XkUa+KWRVPMDhEdPisL6+N1TYvyypjiIHmbIFxpJclur3fqK3igIkQiOxTv1d/Y2Dmv9wj2Y5k2nuyPtsuoKl6eZgDbG2hyPZKgaJiICorw3wvFamoEI77i5Z8iTghm5nJ5xKTZYdv1vCL+awg2fOFrGcGbVvCdBuI="), this.ApiConfig.apiId, this.ApiConfig.apiHash, {
  //     connectionRetries: 5,
  //   });

  //   await this.client.connect();
  //   console.log('Telegram client started');

  //   const me = await this.client.getMe();
  //   console.log('Logged in as:', me?.username || me?.firstName);
  //   console.log('Phone number (if available):', me?.phone || 'Not available');

  //   this.client.addEventHandler(this.onNewMessage.bind(this), new NewMessage({}));

  //   console.log('Listening for new messages...');
  // }

  // private async onNewMessage(event) {
  //   const messageText = event.message.message;
  //   const sender = await event.message.getSender();
  //   const senderName = sender?.firstName || 'Unknown';

  //   console.log(`[${senderName}]: ${messageText}`);
  // }









  async sendCode(phone: string) {
    try {
      console.log('Sending code to: ' + phone)
      const response = await this.client.sendCode(this.ApiConfig, phone)
      if (response) {
        console.log('Code sent!')
      }
      return response
    } catch (error) {
      console.log(error)
      throw new HttpException({ message: "PHONE_NUMBER_INVALID" }, 400)
    }
  }

  async getAccounts(user: User) {
    try {
      return await this.accountModel.find({ user: user._id })
    } catch (error) {
      throw error
    }
  }

  async getAccount(id: string) {
    try {
      const account = await this.accountModel.findOne({ id })
      if (!account) {
        console.error('account not found')
        throw new NotFoundException('ACCOUNT_NOT_FOUND')
      }
      return account
    } catch (error) {
      return error
    }
  }

  async deleteAccount(id: string) {
    try {
      const deleted = await this.accountModel.findByIdAndDelete({ id })
      return deleted
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  async findByPhoneNumber(phone: string) {
    try {
      const account = await this.accountModel.findOne({
        phone
      })
      if (account) {
        console.log('Found exiating account!')
      }
      return account
    } catch (error) {
      throw new HttpException({ message: 'Failed to find account by phone number' }, 500)
    }
  }

  async createSession(
    hash: string,
    code: string,
    phone: string,
    password?: string
  ): Promise<any> {
    try {
      await this.client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone,
          phoneCode: code,
          phoneCodeHash: hash,
        })
      );
      console.log("Signed in successfully");
    } catch (error) {
      if (error.errorMessage === "SESSION_PASSWORD_NEEDED") {
        if (!password) {
          throw new HttpException({ message: "SESSION_PASSWORD_NEEDED" }, 400);
        }
        const passwordInfo = await this.client.invoke(new Api.account.GetPassword());
        const passwordHash = await computeCheck(passwordInfo, password);
        try {
          await this.client.invoke(
            new Api.auth.CheckPassword({
              password: passwordHash,
            })
          );
        } catch (passError) {
          throw new HttpException({ message: "PASSWORD_HASH_INVALID" }, 400);
        }
      }
      else {
        throw new HttpException(error.message, 500);
      }
    }

    const me = await this.client.getMe();
    const { fullUser } = await this.client.invoke(new Api.users.GetFullUser({ id: me }))
    const avatar = await this.client.downloadProfilePhoto(me)
    console.log(avatar)
    console.log(avatar)
    return { accountInfo: me, session: this.client.session.save(), user: fullUser, avatar: `data:image/jpeg;base64,${avatar.toString('base64')}` };
  }

}
