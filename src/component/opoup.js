import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "aos/dist/aos.css";
import AOS from "aos";
import "../style/style.css";
function PopupComponent(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const popupRef = useRef(null);

  const handleOpen = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    AOS.init({ duration: 700 });
    // you can use the userData here, or set it to state using setUser
  }, []);

  const handleAdd = async () => {
    setIsOpen(false);
    setInputValue("");
    setSelectedOption("");

    await props.handleAdd(selectedOption, inputValue);
    await props.fetchData();
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex justify-center items-center gap-2 p-2 w-[9rem] bg-indigo-500 rounded-md  text-white text-sm"
      >
        Tambah Pelaksana
      </button>

      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="popup "
        unmountOnExit
      >
        <div
          ref={popupRef}
          data-aos="slide-down"
          className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center  z-[99998]"
        >
          <div className="bg-white rounded p-4 w-full">
            <h2 className="text-xl font-semibold mb-8">Tambah Pelaksana</h2>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full p-2 pl-10 text-base text-gray-700 border-2 border-indigo-500 rounded-xl "
              placeholder="Masukkan Posisi"
            />
            <select
              value={selectedOption}
              onChange={handleSelectChange}
              className="w-full p-2 pl-10 mt-5 mb-5 text-base bg-indigo-100 text-indigo-500 border-2 border-indigo-500 rounded-xl"
            >
              <option
                value=""
                className="text-base"
                style={{ fontSize: "14px" }}
              >
                Pilih Pelaksana
              </option>
              {props.data.map((data) => (
                <option
                  value={data.id}
                  className="text-sm"
                  style={{ fontSize: "14px" }}
                >
                  {data.nama}
                </option>
              ))}
            </select>

            <div className="flex w-full justify-center gap-10 ">
              <button
                onClick={handleClose}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-10 rounded-xl"
              >
                Keluar
              </button>
              <button
                onClick={handleAdd}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-2 px-10 rounded-xl"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}

export default PopupComponent;
