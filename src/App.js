import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { db } from "../src/config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Login from "./pages/auth/login";
import SignUp from "./pages/auth/signUp";
import Home from "./pages/home";
import ListEvent from "./pages/event/listEvent";
import DetailEvent from "./pages/event/detailEvent";
import InputEvent from "./pages/event/inputEvent";
import EditEvent from "./pages/event/updateEvent";
import InputCatatan from "./pages/event/inputCatatan";
import InputLogistik from "./pages/event/inputLogistik";
import InputPelaksana from "./pages/event/inputPelaksana";
import InputLogistikAkhir from "./pages/event/inputLogistikAkhir";
import ListLogistik from "./pages/event/listLogistik";
import ListCatatan from "./pages/event/listCatatan";
import ProfileUser from "./pages/auth/profile";
import UpdateProfil from "./pages/auth/updateProfil";
function App() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const [user, setUser] = useState(null);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    getUser(userEmail);
    // you can use the userData here, or set it to state using setUser
  }, []);
  const getUser = async (email) => {
    try {
      const userRef = collection(db, "pelaksanaEvent");
      const q = query(userRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log(userData, "userrrrr");

      // Set state with user data and ID
      setUser(userData);
      setIsUser(true);
      return { ...userData, id: userId };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/profil" element={<ProfileUser />} />
              <Route path="/update-profil" element={<UpdateProfil />} />
              <Route path="/detail-event/:id" element={<DetailEvent />} />
              <Route path="/list-event" element={<ListEvent />} />
              <Route path="/list-catatan/:id" element={<ListCatatan />} />
              <Route path="/list-logistik/:id" element={<ListLogistik />} />
              <Route path="/input-event" element={<InputEvent />} />
              <Route path="/update-event/:id" element={<EditEvent />} />
              <Route path="/input-catatan/:id" element={<InputCatatan />} />
              <Route path="/input-logistik/:id" element={<InputLogistik />} />
              <Route
                path="/input-logistik-akhir/:id/:logistik"
                element={<InputLogistikAkhir />}
              />
              <Route path="/input-pelaksana" element={<InputPelaksana />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/daftar" element={<SignUp />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
