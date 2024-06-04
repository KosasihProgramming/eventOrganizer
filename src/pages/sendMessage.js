import React, { useEffect, useRef, useState } from "react";
import AOS from "aos";
import Swal from "sweetalert2";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";
const YourComponent = () => {
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selesaiEvents, setSelesaiEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [isSend, setIsSend] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      AOS.init({ duration: 700 });
      getAllEvents();
      hasRun.current = true;
    }
  }, [isSend]);

  const handleSend = (cek, text) => {
    if (!cek) {
      sendMessage(text);
    }
  };

  const sendMessage = async (text) => {
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
        setIsSend(true);
      } else {
        Swal.fire("Perhatian", "Alasan Gagal dikirim", "warning");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };
  const getAllEvents = async () => {
    try {
      const eventsCollection = collection(db, "event");
      const snapshot = await getDocs(eventsCollection);
      const events = [];

      for (let doc of snapshot.docs) {
        const eventData = { id: doc.id, ...doc.data() };
        const organizerDetails = await fetchOrganizerDetails(doc.id);
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

      const dataClear = filterUpcomingTrips(upcomingEvents);
      const text = formatEventDetails(dataClear);
      let cek = false;
      handleSend(cek, text);
      cek = true;

      console.log(dataClear, "clear");
      setEvents(events);
      setUpcomingEvents(upcomingEvents);
      setSelesaiEvents(selesaiEvents);
      setOngoingEvents(ongoingEvents);
      setIsSend(true);
    } catch (error) {
      console.error("Error getting Events:", error);
    }
  };

  const fetchOrganizerDetails = async (idEvent) => {
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

  const filterUpcomingTrips = (trips) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return trips.filter((trip) => {
      const tripDate = new Date(trip.tanggal);
      return tripDate >= today;
    });
  };

  const formatKapital = (string) => {
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  const formatEventDetails = (events) => {
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
          .map((p) => `${formatKapital(p.nama)} (${formatKapital(p.posisi)})`)
          .join(", ");

        return `<b>tanggal : </b>${formatTanggal(
          tanggal
        )}\n<b>Judul Event : </b>${formatKapital(
          judul
        )}\n<b>Deskripsi: </b>${formatKapital(
          deskripsi
        )}\n<b>Pukul : </b>${jamMulai} - ${jamSelesai}\n<b>Lokasi : </b>${formatKapital(
          lokasi
        )}\n<b>Pelaksana : </b>${
          pelaksanaStr == "" ? "Belum Ada Pelaksana" : pelaksanaStr
        }`;
      })
      .join("\n\n");
  };

  const formatTanggal = (tanggal) => {
    const hari = dayjs(tanggal).locale("id").format("dddd");
    const bulan = dayjs(tanggal).locale("id").format("MMMM");
    const hasil =
      tanggal.substring(8, 10) + " " + bulan + " " + tanggal.substring(0, 4);
    console.log("tanggal", dayjs(tanggal).locale("id").format("MMMM"));

    return hasil;
  };
  return <div>{/* Your component JSX here */}</div>;
};

export default YourComponent;
