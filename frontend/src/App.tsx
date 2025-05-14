// import React, { useState } from 'react';
// import axios from 'axios';

// function App() {
//   const [phone, setPhone] = useState('');
//   const [phoneCode, setPhoneCode] = useState('');
//   const [phoneCodeHash, setPhoneCodeHash] = useState(null);
//   const [chats, setChats] = useState([]);

//   const sendCode = async () => {
//     const res = await axios.post('http://localhost:5000/auth', { phone });
//     setPhoneCodeHash(res.data.phoneCodeHash);
//   };

//   const verifyCode = async () => {
//     await axios.post('http://localhost:5000/verify', { phone, phoneCode, phoneCodeHash });
//     getChats();
//   };

//   const getChats = async () => {
//     const res = await axios.get('http://localhost:5000/chats');
//     setChats(res.data.dialogs);
//   };

//   return (
//     <div>
//       <h2>Telegram Client</h2>
//       {/* <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone" /> */}
//       <button onClick={getChats}>get chats</button>
//       {/* {phoneCodeHash && (
//         <>
//           <input value={phoneCode} onChange={e => setPhoneCode(e.target.value)} placeholder="Enter code" />
//           <button onClick={verifyCode}>Verify</button>
//         </>
//       )} */}
//       <ul>
//         {chats.map(chat => (
//           <li key={chat.id}>{chat.id}</li>

//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;
