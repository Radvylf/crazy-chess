const modal_cont = document.getElementById("modal_cont");
const lobby_id_input = document.getElementById("lobby_id");
const go_btn = document.getElementById("go");
const lobby_btn = document.getElementById("init_lobby");
const choose_lobby_cont = document.getElementById("choose_lobby_cont");
const lobby_id_cont = document.getElementById("show_lobby_id_cont");
const show_lobby_id_h1 = document.getElementById("show_lobby_id");
const countdown_cont = document.getElementById("countdown_cont");
const countdown = document.getElementById("countdown");

lobby_id_input.focus();

lobby_id_input.onkeydown = (event) => {
    if (event.code == "Enter") go_btn.click();
};

lobby_id_input.oninput = () => {
    lobby_btn.disabled = lobby_id_input.value != "";
};

go_btn.onclick = () => {
    const lobby_id = lobby_id_input.value;

    if (!lobby_id.match(/^[0-9a-zA-Z]{8}$/)) {
        alert("Invalid lobby ID");

        return;
    }

    start_ws(lobby_id);

    lobby_id_input.disabled = true;
    go_btn.disabled = true;
    lobby_btn.disabled = true;
};

lobby_btn.onclick = () => {
    start_ws(null);

    lobby_id_input.disabled = true;
    go_btn.disabled = true;
    lobby_btn.disabled = true;
};

function show_lobby_id(lobby_id) {
    choose_lobby_cont.style.display = "none";
    lobby_id_cont.style.display = "block";

    show_lobby_id_h1.textContent = lobby_id;
}

function lobby_id_not_found() {
    lobby_id_input.disabled = false;
    go_btn.disabled = false;
    lobby_btn.disabled = lobby_id_input.value != "";

    lobby_id_input.focus();

    alert("Lobby ID not found");
}

function start_game() {
    modal_cont.style.display = "none";
    countdown_cont.style.display = "flex";

    setTimeout(() => {
        countdown.textContent = "2";

        setTimeout(() => {
            countdown.textContent = "1";

            setTimeout(() => {
                countdown_cont.style.display = "";
            }, 1000);
        }, 1000);
    }, 1000);
}