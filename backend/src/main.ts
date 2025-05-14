import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramClientFactory } from './telegram/telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessageEvent } from 'telegram/events';
import { Api } from 'telegram';
import { nc } from './nats';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3000);
  app.enableCors(); +16606601433

  await TelegramClientFactory.createClient('8U7-VLCQ', {
    session: new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUF7Yq9qhlXN+mA+8mB+1yQc9kdTLuwL8murATSI4UgmvzjWdxbC+THdlUcdADddin/yx6+ix9+jH3Q9kvlfEo4+fdkBy3M0J184GvAKVPVVDSwzbxrv72YB9DnYKhLRt0urOwxxCsjcaSvtPraxhCtQOGUk0PqRoQYcvKzyPNJpCLwARzcWYtXuZ1Kt2cnCrtTJYj+Om6cf/YzkkkRrTE6i5HzFXIo08QrMsDIHHUEHRWeqnlDI6LALCdUue8HA/oXcF94s9FHlcu99P62+G0mpVXb/1pcHj9jHYfL49kDR9XYck90oLa930cR0Yu7v54B/T25d+o9j1JGCYzr3Ftt8="),
    apiId: 19177732,
    apiHash: "b100d80721045777438318e47409ecae",
    connectionRetries: 5
  });



  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let defaultDelayMs = 50000;
  const client = await TelegramClientFactory.getClient('8U7-VLCQ');


  // console.log(await client.getMe())
  const nats = await nc()


  // nats.on('algo', async (req, res) => {
  //   console.log('got algo')
  //   console.log(req)
  //   res.send(await client.getMe()

  //   )
  // })

  // const response = await nats.request(
  //   'algo', await client.getMe()
  // )

  // console.log(response)

  // Array of major Spanish cities and regions (over 100 to help reach 600 search variations)
  const spanishCities = [
    // Major cities
    // 'Мадрид', 'Барселона', 'Валенсия', 'Севилья', 'Сарагоса', 'Малага', 'Мурсия',
    // 'Пальма', 'Лас-Пальмас', 'Бильбао', 'Аликанте', 'Кордова', 'Вальядолид',
    // 'Виго', 'Хихон', 'Эспаньола', 'Витория', 'Гранада', 'Эльче', 'Овьедо',
    // 'Террасса', 'Баракальдо', 'Мостолес', 'Санта-Крус', 'Памплона', 'Альмерия',

    // // Tourist destinations
    // 'Торревьеха', 'Бенидорм', 'Марбелья', 'Ибица', 'Майорка', 'Тенерифе', 'Коста-Брава',
    // 'Коста-дель-Соль', 'Коста-Бланка', 'Льорет-де-Мар', 'Салоу', 'Фуэртевентура',
    // 'Гран-Канария', 'Лансароте', 'Менорка', 'Форментера', 'Ла-Манга', 'Эстепона',
    // 'Ронда', 'Нерха', 'Кадакес', 'Таррагона', 'Кадис', 'Сан-Себастьян', 'Сантандер',

    // // Regions and provinces
    // 'Каталония', 'Андалусия', 'Валенсия', 'Галисия', 'Кастилия', 'Кантабрия', 'Астурия',
    // 'Арагон', 'Наварра', 'Балеарские', 'Канарские', 'Риоха', 'Эстремадура', 'Мурсия',

    // // Additional keywords
    // 'Испания русские', 'Испания недвижимость', 'Испания туризм', 'Испания отдых',
    // 'Испания работа', 'Испания бизнес', 'Испания эмиграция', 'Испания переезд',
    // 'Испания учеба', 'Испания ВНЖ', 'Испания ПМЖ', 'Русские в Испании',
    // 'Русскоязычные в Испании', 'Россияне в Испании', 'Аренда в Испании',
    // 'Покупка в Испании', 'Жизнь в Испании', 'Отпуск в Испании', 'Виза в Испанию',

    // // Detailed combinations
    // 'Мадрид русские', 'Барселона русские', 'Валенсия русские', 'Малага русские',
    // 'Аликанте русские', 'Торревьеха русские', 'Бенидорм русские', 'Марбелья русские',
    // 'Тенерифе русские', 'Ибица русские', 'Майорка русские', 'Канары русские',
    // 'Каталония русские', 'Андалусия русские', 'Коста Бланка русские', 'Коста дель Соль русские',

    // // With "чат" keyword
    // 'Испания чат', 'Мадрид чат', 'Барселона чат', 'Валенсия чат', 'Малага чат',
    // 'Аликанте чат', 'Торревьеха чат',
    // 'Бенидорм чат', 'Русские Испания чат',

    // With "форум" keyword
    // 'Испания форум', 'Мадрид форум', 'Барселона форум', 'Валенсия форум',
    // 'Малага форум', 'Аликанте форум', 'Торревьеха форум', 'Бенидорм форум',

    // Additional coastal areas and tourist spots
    // 'Пеньискола', 'Беникасим', 'Кастельон', 'Оропеса', 'Кульера', 'Беничофар',
    // 'Ориуэла', 'Гуардамар', 'Пунта Прима', 'Кабо Роиг', 'Пилар де ла Орадада',
    // 'Мил Пальмерас', 'Санта Пола', 'Аликанте центр', 'Аликанте порт',
    // 'Бенальмадена', 'Фуэнхирола', 'Михас', 'Торремолинос', 'Нерха', 'Альмуньекар',
    // 'Села Мальта', 'Пуэрто Банус', 'Михас Коста', 'Ла Карихуэла', 'Эль Робледаль',

    // Practical Spanish keywords
    // 'Недвижимость Испания', 'Покупка квартиры Испания', 'Аренда жилья Испания',

    // 'Переезд в Испанию',
    // 'Работа Испания',
    // 'Учеба Испания',
    // 'Врачи Испания',
    // 'Медицина Испания', 'Легализация Испания', 'Документы Испания', 'Налоги Испания',
    // 'Бизнес Испания', 'Школы Испания', 'Банки Испания', 'Страхование Испания',
    // 'Автомобили Испания',
    //  'Транспорт Испания', 'Рестораны Испания русские',
    // 'Магазины Испания русские', 'Юристы Испания русские', 'Адвокаты Испания',

    // Community and services
    // 'Русская община Испания', 'Соотечественники Испания', 'Православные Испания',
    // 'Альбир', 'Альтеа', 'Кальпе', 'Хавеа', 'Дения', 'Гандия', 'Олива',
    // 'Русские врачи Испания', 'Русские школы Испания', 'Русские магазины Испания',

    // 'Русские рестораны Испания', 
    // 'Русские СМИ Испания', 'Русское радио Испания',
    // 'Русское ТВ Испания', 'Русские детские сады Испания', 'Русские мероприятия Испания',

    // // Additional regional cities
    // 'Аликанте провинция', 'Валенсия провинция', 'Кастельон провинция', 
    // 'Малага провинция',
    // 'Жирона провинция', 'Таррагона провинция', 'Барселона провинция', 'Мурсия регион',
    // 'Аликанте регион', 'Валенсия регион', 'Малага регион', 'Канарские острова',
    // 'Балеарские острова',

    // More tourist zones
    // 'Коста Тропикаль', 'Коста де Альмерия', 'Коста де ла Лус', 'Коста Дорада',
    // 'Коста дель Гарраф', 'Коста дель Маресме', 'Коста Верде', 'Коста Васка'
  ];

  // let totalChannelsFound = 0;
  // let totalChannelsJoined = 0;
  // let processedSearches = 0;

  // console.log(`🔍 Starting search process for ${spanishCities.length} Spanish city keywords in Russian`);

  // for (const city of spanishCities) {
  //   processedSearches++;
  //   console.log(`\n======================================================`);
  //   console.log(`🔍 Search ${processedSearches}/${spanishCities.length}: "${city}"`);
  //   try {
  //     const result = await client.invoke(
  //       new Api.contacts.Search({
  //         q: city,
  //         limit: 100,
  //       })
  //     );

  //     // Filter only channels that have the Channel class name, aren't megagroups, and aren't broadcast channels
  //     const channels = result.chats.filter(
  //       (chat: any) => chat.className === "Channel" && !chat.broadcast
  //     );

  //     // Show total channels found for this city
  //     console.log(`🔍 Found: ${channels.length} channels matching "${city}"`);
  //     totalChannelsFound += channels.length;

  //     if (channels.length > 0) {
  //       let joinedCount = 0;
  //       const totalToJoin = channels.length;

  //       for (const channel of channels) {
  //         let delayMs = defaultDelayMs;
  //         const remaining = totalToJoin - joinedCount;

  //         // Safely get channel title
  //         const channelTitle = getChannelTitle(channel);

  //         console.log(`⏳ Progress: Joined: ${joinedCount}, To Join: ${remaining}`);
  //         console.log(`➡️ Joining: ${channelTitle}`);

  //         try {
  //           await client.invoke(
  //             new Api.channels.JoinChannel({
  //               channel,
  //             })
  //           );

  //           joinedCount++;
  //           totalChannelsJoined++;
  //           console.log(`✅ Joined: ${channelTitle}`);
  //         } catch (error: any) {
  //           const msg = error.message || "";

  //           // Handle both formats of flood wait error messages
  //           const floodMatch = msg.match(/FLOOD_WAIT_(\d+)/);
  //           const waitMatch = msg.match(/A wait of (\d+) seconds is required/);

  //           if (floodMatch || waitMatch) {
  //             // Extract seconds from whichever regex matched
  //             const waitSeconds = parseInt(floodMatch ? floodMatch[1] : waitMatch[1]);
  //             // Add random buffer between 1-5 seconds
  //             const bufferSeconds = Math.floor(Math.random() * 5) + 1;
  //             const totalWaitSeconds = waitSeconds + bufferSeconds;
  //             delayMs = totalWaitSeconds * 1000;

  //             console.warn(`⏱ FLOOD_WAIT detected: Waiting ${waitSeconds} seconds + ${bufferSeconds} buffer = ${totalWaitSeconds} seconds`);

  //             // Actually wait here before attempting next join
  //             console.log(`⏳ Pausing join operations until ${new Date(Date.now() + delayMs).toLocaleTimeString()}...`);
  //             await sleep(delayMs);
  //             console.log(`▶️ Resuming join operations now.`);
  //           } else {
  //             console.warn(`❌ Failed to join ${channelTitle}: ${msg}`);
  //           }
  //         }

  //         // Only wait the default time if we didn't encounter a flood wait
  //         // const wasFloodWait = (error: any) => {
  //         //   const msg = error?.message || "";
  //         //   return msg.includes("FLOOD_WAIT") || msg.includes("A wait of");
  //         // };

  //         // if (remaining > 1 && !wasFloodWait(error)) {
  //         //   console.log(`⏳ Waiting ${defaultDelayMs / 1000} seconds before next join...`);
  //         //   await sleep(defaultDelayMs);
  //         // }

  //         let hadFloodWait = false;

  //         try {
  //           await client.invoke(
  //             new Api.channels.JoinChannel({
  //               channel,
  //             })
  //           );

  //           joinedCount++;
  //           totalChannelsJoined++;
  //           console.log(`✅ Joined: ${channelTitle}`);
  //         } catch (error: any) {
  //           const msg = error.message || "";

  //           // Handle both formats of flood wait error messages
  //           const floodMatch = msg.match(/FLOOD_WAIT_(\d+)/);
  //           const waitMatch = msg.match(/A wait of (\d+) seconds is required/);

  //           if (floodMatch || waitMatch) {
  //             // Set the flag that we had a flood wait
  //             hadFloodWait = true;

  //             // Extract seconds from whichever regex matched
  //             const waitSeconds = parseInt(floodMatch ? floodMatch[1] : waitMatch[1]);
  //             // Add random buffer between 1-5 seconds
  //             const bufferSeconds = Math.floor(Math.random() * 5) + 1;
  //             const totalWaitSeconds = waitSeconds + bufferSeconds;
  //             delayMs = totalWaitSeconds * 1000;

  //             console.warn(`⏱ FLOOD_WAIT detected: Waiting ${waitSeconds} seconds + ${bufferSeconds} buffer = ${totalWaitSeconds} seconds`);

  //             // Actually wait here before attempting next join
  //             console.log(`⏳ Pausing join operations until ${new Date(Date.now() + delayMs).toLocaleTimeString()}...`);
  //             await sleep(delayMs);
  //             console.log(`▶️ Resuming join operations now.`);
  //           } else {
  //             console.warn(`❌ Failed to join ${channelTitle}: ${msg}`);
  //           }
  //         }

  //         // Only wait the default time if we didn't encounter a flood wait
  //         if (remaining > 1 && !hadFloodWait) {
  //           console.log(`⏳ Waiting ${defaultDelayMs / 1000} seconds before next join...`);
  //           await sleep(defaultDelayMs);
  //         }
  //       }

  //       console.log(`🎉 City "${city}" completed! Joined ${joinedCount} out of ${totalToJoin} channels.`);
  //     }

  //     // Wait between city searches to avoid rate limits
  //     console.log(`\n⏳ Waiting 5 seconds before searching next city...`);
  //     await sleep(5000);

  //   } catch (error) {
  //     console.error(`❌ Search for "${city}" failed:`, error);
  //   }

  //   // Update overall progress
  //   console.log(`\n📊 OVERALL PROGRESS: Searched ${processedSearches}/${spanishCities.length} keywords`);
  //   console.log(`📊 Total channels found: ${totalChannelsFound}`);
  //   console.log(`📊 Total channels joined: ${totalChannelsJoined}`);
  // }

  // console.log(`\n=======================================================`);
  // console.log(`🎉🎉🎉 SEARCH PROCESS COMPLETED! 🎉🎉🎉`);
  // console.log(`📊 Total search keywords processed: ${processedSearches}`);
  // console.log(`📊 Total channels found: ${totalChannelsFound}`);
  // console.log(`📊 Total channels joined: ${totalChannelsJoined}`);
  // console.log(`=======================================================`);

  // return { processedSearches, totalChannelsFound, totalChannelsJoined };
}

// Helper function to safely get channel title
// function getChannelTitle(channel: any): string {
//   if (!channel) return "Unknown Channel";

//   // Try different properties where title might be stored
//   if (typeof channel.title === 'string') {
//     return channel.title;
//   }

//   // For Chat objects
//   if (typeof channel.chat?.title === 'string') {
//     return channel.chat.title;
//   }

//   // For access via getter
//   if (typeof channel.getTitle === 'function') {
//     return channel.getTitle();
//   }

//   // If channel has an id, use that as fallback
//   if (channel.id) {
//     return `Channel #${channel.id}`;
//   }

//   return "Unnamed Channel";
// }

bootstrap();