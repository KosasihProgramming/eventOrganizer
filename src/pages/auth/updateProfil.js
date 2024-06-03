import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Select from "react-tailwindcss-select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { db, dbImage } from "../../config/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import withRouter from "../../withRouter";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
class UpdateProfil extends React.Component {
  constructor(props) {
    super(props);
    const { id } = this.props.params;
    this.state = {
      id: id,
      user: {},
      nama: null,
      kontak: "",
      tanggalLahir: "",
      jenis_kelamin: "",
      umur: 0,
      pengalaman: "",
      alamat: "",
      fotoDisplay: null,
      gambar: null,
      lokasi: null,
      pasien: 0,
    };
  }

  async componentDidMount() {
    const userEmail = sessionStorage.getItem("userEmail");
    console.log(userEmail);
    await this.getUser(userEmail);
  }
  getUser = async (email) => {
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
      this.setState({ user: { ...userData, id: userId } }, () => {
        this.setNilaiState({ ...userData, id: userId });
      });

      return { ...userData, id: userId };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = (event) => {
      this.setState({ fotoDisplay: event.target.result, gambar: file });
    };

    reader.readAsDataURL(file);
  };

  hitungUmur = async (selectedDate) => {
    const tanggalLahir = new Date(selectedDate);
    const tahunSekarang = new Date().getFullYear();
    const dokter = this.state.dokter;
    try {
      const tanggalLahirObj = new Date(tanggalLahir);
      const tahunLahir = tanggalLahirObj.getFullYear();
      const bulanLahir = tanggalLahirObj.getMonth() + 1;

      let umur = tahunSekarang - tahunLahir;

      if (
        new Date(tahunSekarang, bulanLahir - 1, tanggalLahirObj.getDate()) >
        new Date()
      ) {
        umur--;
      }

      const year = tanggalLahir.getFullYear();
      const month = String(tanggalLahir.getMonth() + 1).padStart(2, "0"); // Tambah 1 karena bulan dimulai dari 0
      const day = String(tanggalLahir.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      await new Promise((resolve) => {
        this.setState({ umur: umur, tanggalLahir: formattedDate }, resolve);
      });
      return umur;
    } catch (error) {
      console.error("gagal menghitung");
      throw error;
    }
  };
  setNilaiState = (user) => {
    console.log("usr", user);
    this.setState({
      nama: user.nama,
      kontak: user.nomorHp,
      jenis_kelamin: user.jenis_kelamin,
      umur: user.umur,
      alamat: user.alamat,
      lokasi: user.asalKlinik,
      fotoDisplay: user.foto,
    });
  };
  handleSubmit = async (e) => {
    e.preventDefault();
    if (
      this.state.nama == "" &&
      this.state.jenis_kelamin == "" &&
      this.state.umur == "" &&
      this.state.kontak == "" &&
      this.state.alamat == "" &&
      this.state.foto == null &&
      this.state.fotoDisplay == "" &&
      this.state.lokasi == null
    ) {
      Swal.fire({
        icon: "warning",
        title: "Gagal",
        text: "Lengkapi Semua Data",
        timer: 3000,
      });
    } else {
      this.setState({ isProses: true });
      const {
        user,
        nama,
        kontak,
        tanggalLahir,
        jenis_kelamin,
        umur,
        alamat,
        gambar,
        lokasi,
      } = this.state;
      const updateData = {};
      const id = user.id;
      alert(id);
      console.log(user, "hbgdjhash");
      console.log("sebelum", gambar);
      try {
        // Upload gambar baru (jika ada)
        if (gambar) {
          const imageUrl = nama.toLowerCase().replace(/\s+/g, "-");
          const imgRef = ref(dbImage, `pelaksanaEvent/${imageUrl}`);
          console.log("proses sebelum upload", imgRef);

          await uploadBytes(imgRef, gambar);
          const foto_tindakan = await getDownloadURL(imgRef);
          console.log("proses sesudah upload", foto_tindakan);

          // Update properti foto_tindakan pada dokumen tindakan yang sesuai
          await updateDoc(doc(db, "pelaksanaEvent", id), {
            nama: nama,
            nomorHp: kontak,
            tanggal_lahir: tanggalLahir,
            jenis_kelamin: jenis_kelamin,
            umur: umur,
            alamat: alamat,
            foto: foto_tindakan,
            asalKlinik: lokasi,
          });
        } else {
          // Jika tidak ada gambar baru, hanya perbarui properti nama_tindakan dan deskripsi_tindakan
          await updateDoc(doc(db, "pelaksanaEvent", id), {
            nama: nama,
            nomorHp: kontak,
            tanggal_lahir: tanggalLahir,
            jenis_kelamin: jenis_kelamin,
            umur: umur,
            alamat: alamat,
            asalKlinik: lokasi,
          });
        }

        Swal.fire({
          icon: "success",
          text: "Data Profil Berhasil Diperbarui",
          confirmButtonColor: "#6366F1",
          confirmButtonText: "Ya",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/profil";
          }
        });
      } catch (error) {
        console.error("Error updating data:", error);
        Swal.fire("Error", "Gagal Memperbarui Data Dokter", "error");
        this.setState({ isProses: false });
      }
    }
  };

  render() {
    const options = [
      { value: "Laki-laki", label: "Laki-laki" },
      { value: "Perempuan", label: "Perempuan" },
    ];
    const optionsLokasi = [
      { value: "GTS Tirtayasa", label: "GTS Tirta" },
      { value: "GTS Palapa", label: "GTS Palapa" },
      { value: "GTS Kemiling", label: "GTS Kemiling" },
    ];
    const { dokter } = this.state;
    const theme = sessionStorage.getItem("theme");

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          overflowX: "hidden",
        }}
        className={`${theme == "true" ? "dark" : ""}`}
      >
        <div className="flex flex-col  gap-0 h-[100%] items-center font-medium bg-white w-[100%] pb-10 dark:bg-slate-900">
          <div className="flex overflow-x-hidden relative flex-col px-5 w-full mt-6">
            <div className=" flex justify-between items-center relative mb-8 w-full  bg-white dark:p-2 rounded-xl ">
              <button
                onClick={() => {
                  window.location.href = `/profil`;
                }}
                className="w-[100%] flex justify-start items-center"
              >
                <div className="w-[33%] flex justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill=""
                      fill-rule="evenodd"
                      d="m15 4l2 2l-6 6l6 6l-2 2l-8-8z"
                    />
                  </svg>
                </div>
                <div className=" text-2xl font-medium flex justify-start w-[60%]">
                  Edit Profil
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-col w-[100%]  h-[100%] justify-start items-center mb-4 overflow-y-scroll relative">
            <div className="flex flex-col gap-2.5 justify-center font-medium text-center text-indigo-500 max-w-[328px]">
              <div className=" text-[14px] flex justify-center items-center self-center  text-lg tracking-widest whitespace-nowrap bg-indigo-100 h-[120px] rounded-[120px] w-[120px]">
                <img
                  src={this.state.fotoDisplay}
                  alt=""
                  className="text-[14px] object-cover bg-cover flex justify-center items-center self-center  text-lg tracking-widest whitespace-nowrap bg-indigo-100 h-[120px] rounded-[120px] w-[120px]"
                />
              </div>
              <div className="gap-0 mt-2.5 w-full text-[14px] relative">
                <input
                  type="file"
                  accept="image/*"
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  onChange={this.handleFileChange}
                />
                <div className=" flex justify-center items-center p-2 text-indigo-50 bg-indigo-500 h-full w-full rounded-lg">
                  <span className="text-sm">Pilih Foto</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 justify-center w-[100%] h-auto p-4 text-[14px]">
              <div className="gap-0 w-full flex justify-start text-sm text-stone-900">
                Nama
              </div>
              <input
                type="text"
                placeholder="Nama"
                required
                value={this.state.nama}
                onChange={(e) => {
                  this.setState({ nama: e.target.value });
                }}
                name="nama"
                className="text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-4 w-full text-sm flex justify-start text-stone-900 text-[14px]">
                No. Telepon
              </div>
              <input
                type="text"
                placeholder="No Telepon"
                value={this.state.kontak}
                onChange={(e) => {
                  this.setState({ kontak: e.target.value });
                }}
                required
                name="no_hp"
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm rounded border border-solid border-neutral-400 text-neutral-400"
              />

              <div className="gap-0 mt-4 w-full text-sm flex justify-start text-stone-900 text-[14px]">
                Jenis Kelamin
              </div>
              <div className="select-container relative w-[100%]">
                <div className="flex flex-col justify-center px-0 mt-3 w-[100%] text-[14px] text-sm leading-4 capitalize border border-solid border-indigo-500 bg-white text-neutral-950 rounded-lg">
                  <div className="flex items-center px-2.5 h-12 text-lg  w-[100%] bg-indigo-50 border-solid border-indigo-500 rounded-lg  gap-2 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#29a7d1"
                        d="M18.39 14.56C16.71 13.7 14.53 13 12 13s-4.71.7-6.39 1.56A2.97 2.97 0 0 0 4 17.22V20h16v-2.78c0-1.12-.61-2.15-1.61-2.66M12 12c2.21 0 4-1.79 4-4V4.5c0-.83-.67-1.5-1.5-1.5c-.52 0-.98.27-1.25.67c-.27-.4-.73-.67-1.25-.67s-.98.27-1.25.67c-.27-.4-.73-.67-1.25-.67C8.67 3 8 3.67 8 4.5V8c0 2.21 1.79 4 4 4"
                      />
                    </svg>
                    <Select
                      options={options}
                      name="kelamin"
                      placeholder={`Pilih jenis Kelamin ${
                        this.state.jenis_kelamin
                          ? `- ${this.state.jenis_kelamin}`
                          : ""
                      }`}
                      onChange={async (selectedOption) => {
                        await new Promise((resolve) => {
                          this.setState(
                            { jenis_kelamin: selectedOption.value },
                            resolve
                          );
                        });
                      }}
                      classNames={{
                        menuButton: ({ isDisabled }) =>
                          `text-[15px] flex text-sm text-indigo-500 w-[100%] bg-indigo-50 rounded shadow-sm transition-all duration-300 focus:outline-none ${
                            isDisabled
                              ? "bg-indigo-50 "
                              : "bg-indigo-50 focus:ring focus:ring-blue-500/20"
                          }`,
                        menu: "absolute z-10 w-full bg-indigo-50 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700",
                        listItem: ({ isSelected }) =>
                          `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
                            isSelected
                              ? `text-gray-700 bg-indigo`
                              : `text-gray-700 hover:bg-indigo-500 hover:text-indigo-50`
                          }`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="gap-0 mt-5 w-full text-sm flex justify-start text-stone-900 text-[14px]">
                Umur
              </div>
              <input
                type="text"
                placeholder="Umur"
                name="alamat"
                value={this.state.umur}
                onChange={(e) => this.setState({ umur: e.target.value })}
                className=" text-[14px] justify-center px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />

              <div className="gap-0 mt-5 w-full text-sm flex justify-start text-stone-900 text-[14px]">
                Alamat Lengkap
              </div>
              <input
                type="textarea"
                placeholder="Alamat"
                value={this.state.alamat}
                onChange={(e) => {
                  this.setState({ alamat: e.target.value });
                }}
                required
                name="alamat"
                className="justify-center text-[14px] px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
              <div className="gap-0 mt-1 w-full text-sm italic text-right text-zinc-400">
                Maks 100 Karaketer
              </div>
              <div className="gap-0 mt-4 w-full text-sm flex justify-start text-stone-900 text-[14px]">
                Asal Klinik
              </div>
              <input
                type="textarea"
                placeholder="Asal Klinik (Ex. Kosasih Kemiling)"
                value={this.state.lokasi}
                onChange={(e) => {
                  this.setState({ lokasi: e.target.value });
                }}
                required
                name="alamat"
                className="justify-center text-[14px] px-4 py-4 mt-2.5 text-sm whitespace-nowrap rounded border border-solid border-neutral-400 text-neutral-400"
              />
            </div>
            <button
              className="justify-center p-2 w-full text-base text-center text-white bg-indigo-500 rounded-lg max-w-[320px]"
              disabled={this.state.isProses}
              type="submit"
              onClick={this.handleSubmit}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(UpdateProfil);
