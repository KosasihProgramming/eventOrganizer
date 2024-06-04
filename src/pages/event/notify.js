import * as React from "react";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  query,
  limit,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import AOS from "aos";
import { Tabs, Tab } from "react-bootstrap";
import "../../style/tab.css";
import Swal from "sweetalert2";
import "aos/dist/aos.css";

class Notify extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSend: false,
    };
  }

  componentDidMount = async () => {
    AOS.init({ duration: 700 });
    if (this.state.isSend == false) {
      this.getAllEvents();
      this.setState({ isSend: true });
    }
  };

  handleSend = (cek, text) => {
    if (cek === false) {
      this.sendMessage(text);
    }
  };

  sendMessage = async (text) => {
    try {
      const response = await fetch(
        "https://api.telegram.org/bot6982164526:AAFZcqBGMZuHLsgYiuiI4hyhAAzW8ZIOZdc/sendMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: "6546310886",
            text: text,
            parse_mode: "html",
          }),
        }
      );

      if (response.ok) {
        Swal.fire("Berhasil", "Alasan Telah Berhasil Dikirim", "success");
        this.setState({ isSend: true });
      } else {
        Swal.fire("Perhatian", "Alasan Gagal dikirim", "warning");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  fetchOrganizerDetails = async (idEvent) => {
    try {
      const organizerCollectionRef = collection(
        db,
        "event",
        idEvent,
        "organizerId"
      );
      const organizerSnapshot = await getDocs(organizerCollectionRef);
      const organizerDetails = [];

      for (let organizerDoc of organizerSnapshot.docs) {
        let organizerData = organizerDoc.data();
        organizerData.id = organizerDoc.id;

        const refPelaksana = organizerData.refPelaksana;
        const pelaksanaDoc = await getDoc(
          doc(db, "pelaksanaEvent", refPelaksana)
        );
        if (pelaksanaDoc.exists()) {
          const data = pelaksanaDoc.data();
          organizerData.nama = data.nama;
        } else {
          console.log("No such pelaksana document!");
        }

        organizerDetails.push(organizerData);
      }

      return organizerDetails;
    } catch (error) {
      console.error("Error fetching organizer details:", error);
      return [];
    }
  };

  getAllEvents = async () => {
    try {
      const eventsCollection = collection(db, "event");
      const snapshot = await getDocs(eventsCollection);
      const events = [];

      for (let doc of snapshot.docs) {
        const eventData = { id: doc.id, ...doc.data() };
        const organizerDetails = await this.fetchOrganizerDetails(doc.id);
        eventData.organizers = organizerDetails;
        events.push(eventData);
      }

      const upcomingEvents = events.filter(
        (event) => event.status === "upcoming"
      );
      const selesaiEvents = events.filter(
        (event) => event.status === "completed"
      );
      const ongoingEvents = events.filter(
        (event) => event.status === "ongoing"
      );

      const dataClear = this.filterUpcomingTrips(upcomingEvents);
      const text = this.formatEventDetails(dataClear);
      let cek = false;
      this.handleSend(cek, text);
      cek = true;

      console.log(dataClear, "clear");
      this.setState({
        events: events,
        isSend: true,
        upcomingEvents: upcomingEvents,
        selesaiEvents: selesaiEvents,
        ongoingEvents: ongoingEvents,
      });
    } catch (error) {
      console.error("Error getting Events:", error);
    }
  };

  filterUpcomingTrips = (trips) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return trips.filter((trip) => {
      const tripDate = new Date(trip.tanggal);
      return tripDate >= today;
    });
  };

  formatEventDetails = (events) => {
    return events.map((event) => `${event.nama}: ${event.tanggal}`).join("\n");
  };

  formatKapital = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  formatEventDetails = (events) => {
    return events
      .map((event) => {
        const {
          judul,
          lokasi,
          deskripsi,
          jamMulai,
          jamSelesai,
          tanggal,
          organizers,
        } = event;
        const pelaksanaStr = organizers
          .map(
            (p) =>
              `${this.formatKapital(p.nama)} (${this.formatKapital(p.posisi)})`
          )
          .join(", ");

        return `<b>tanggal : </b>${this.formatTanggal(
          tanggal
        )}\n<b>Judul Event : </b>${this.formatKapital(
          judul
        )}\n<b>Deskripsi: </b>${this.formatKapital(
          deskripsi
        )}\n<b>Pukul : </b>${jamMulai} - ${jamSelesai}\n<b>Lokasi : </b>${this.formatKapital(
          lokasi
        )}\n<b>Pelaksana : </b>${pelaksanaStr}`;
      })
      .join("\n\n");
  };

  formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      tanggal.substring(8, 10) + " " + bulan + " " + tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };
  render() {
    const theme = sessionStorage.getItem("theme");
    return <div>yahahaha hayukk</div>;
  }
}

export default Notify;
