import { useState, useRef } from 'react';
import './App.css';

// Import only what you need from Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; // <- Add this line
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCAWGusPZMWNF-0pdq0J8tqJLGjAoblCs4",
  authDomain: "chat-box-b4ef2.firebaseapp.com",
  projectId: "chat-box-b4ef2",
  storageBucket: "chat-box-b4ef2.appspot.com",
  messagingSenderId: "490775962438",
  appId: "1:490775962438:web:40f18fa5e0b3d42ec7fb47",
  measurementId: "G-CTGF0LJVPE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
// Corrected firestore reference

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h2>Secret ChatRoom</h2>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in: ", error);
    }
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
  );
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const queryMessages = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(queryMessages, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    try {
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL
      });

      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!formValue}>send</button>
      </form>
    </>
  );
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
      <p>{text}</p>
    </div>
  );
}

export default App;
