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
import { BaseTelegramClient } from "src/Base/BaseClient";

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

  async updateAccountSession(accountId: string, session: string, accountName?: string) {
    try {
      // Проверяем существование аккаунта
      const existingAccount = await this.accountModel.findOne({ id: accountId });
      if (!existingAccount) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      // Создаем клиент для проверки валидности новой сессии
      const client = new TelegramClient(
        new StringSession(session),
        Number(process.env.API_ID),
        process.env.API_HASH, {}
      );

      await client.connect();
      
      // Проверяем валидность сессии, получая информацию о пользователе
      const accountInfo = await client.getMe();
      
      // Обновляем аккаунт
      const updateData: any = {
        sessionData: session,
        status: 'alive', // Сбрасываем статус ошибки
        username: accountInfo.username,
        firstname: accountInfo.firstName,
        lastname: accountInfo.lastName
      };

      // Если передано новое имя аккаунта, обновляем его тоже
      if (accountName) {
        updateData.name = accountName;
      }

      const updatedAccount = await this.accountModel.findOneAndUpdate(
        { id: accountId },
        updateData,
        { new: true }
      );

      // Обновляем клиент в хранилище
      await this.storage.removeClient(accountId);
      await this.storage.addClient(accountId, session);

      return { 
        success: true, 
        account: updatedAccount 
      };
    } catch (error) {
      console.error('Error updating account session:', error);
      throw new BadRequestException(`Failed to update account session: ${error.message}`);
    }
  }

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
