
var cal = {
 
  sMon : false, // semana começa no domingo? falso
  mName : ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], // Month Names

  
  data : null, 
  sDay : 0, sMth : 0, sYear : 0, // seleção de dia, mês e ano

  // elementos de HTML 
  hMth : null, hYear : null, //  selector de mês e ano
  hForm : null, hfHead : null, hfDate : null, hfTxt : null, hfDel : null, // formulário de evento

  // Início do calendário
  init : () => {
   
    cal.hMth = document.getElementById("cal-mth");
    cal.hYear = document.getElementById("cal-yr");
    cal.hForm = document.getElementById("cal-event");
    cal.hfHead = document.getElementById("evt-head");
    cal.hfDate = document.getElementById("evt-date");
    cal.hfTxt = document.getElementById("evt-details");
    cal.hfDel = document.getElementById("evt-del");
    document.getElementById("evt-close").onclick = cal.close;
    cal.hfDel.onclick = cal.del;
    cal.hForm.onsubmit = cal.save;

    // data actual
    let now = new Date(),
        nowMth = now.getMonth(),
        nowYear = parseInt(now.getFullYear());

    
    for (let i=0; i<12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.mName[i];
      if (i==nowMth) { opt.selected = true; }
      cal.hMth.appendChild(opt);
    }
    cal.hMth.onchange = cal.list;

    // seletor de anos. podemos definir o range de anos, por exemplo 10, 15 etc...

    for (let i=nowYear-10; i<=nowYear+10; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = i;
      if (i==nowYear) { opt.selected = true; }
      cal.hYear.appendChild(opt);
    }
    cal.hYear.onchange = cal.list;

    // desenha o caleendário na tela
    cal.list();
  },

  // desenha o calendário para o mês seleccionado
  list : () => {
    // fórmula de cálculo para o inicio e final do mês
    cal.sMth = parseInt(cal.hMth.value); // mês seleccionado
    cal.sYear = parseInt(cal.hYear.value); // ano seleccionado
    let daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // numero de dias do mês
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // primeiro dia do mês
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // ultmo dia do mês
        now = new Date(), // data atual
        nowMth = now.getMonth(), // mês atual
        nowYear = parseInt(now.getFullYear()), // ano atual
        nowDay = cal.sMth==nowMth && cal.sYear==nowYear ? now.getDate() : null ;

    // carrega os dados alojados em localstorage
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else { cal.data = JSON.parse(cal.data); }

    
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay==0 ? 7 : startDay ;
      for (let i=1; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i=0; i<startDay; i++) { squares.push("b"); }
    }

    // dias do mês
    for (let i=1; i<=daysInMth; i++) { squares.push(i); }

    // quadros brancos após o ultimo dia do mês
    if (cal.sMon && endDay != 0) {
      let blanks = endDay==6 ? 1 : 7-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay==0 ? 6 : 6-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }

    // recolhe informações acerca do estilo
    let container = document.getElementById("cal-container"),
    cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // linha com os dias da semana
    let cRow = document.createElement("tr"),
        days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    if (cal.sMon) { days.push(days.shift()); }
    for (let d of days) {
      let cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);

    // tabela com dias do mês
    let total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");
    for (let i=0; i<total; i++) {
      let cCell = document.createElement("td");
      if (squares[i]=="b") { cCell.classList.add("blank"); }
      else {
        if (nowDay==squares[i]) { cCell.classList.add("today"); }
        cCell.innerHTML = `<div class="dd">${squares[i]}</div>`;
        if (cal.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
        }
        cCell.onclick = () => { cal.show(cCell); };
      }
      cRow.appendChild(cCell);
      if (i!=0 && (i+1)%7==0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }

    // desactiva a janela de eventos
    cal.close();
  },

  // mostra os dados do evento e opções de edição
  show : (el) => {
    // pega os dados do evento para aquele dia
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    let isEdit = cal.data[cal.sDay] !== undefined ;

    // actualiza evento
    cal.hfTxt.value = isEdit ? cal.data[cal.sDay] : "" ;
    cal.hfHead.innerHTML = isEdit ? "EDITAR NOTA" : "ADICIONAR NOTA" ;
    cal.hfDate.innerHTML = `${cal.sDay} ${cal.mName[cal.sMth]} ${cal.sYear}`;
    if (isEdit) { cal.hfDel.classList.remove("ninja"); }
    else { cal.hfDel.classList.add("ninja"); }
    cal.hForm.classList.remove("ninja");
  },

  // fecha a janela de eventos
  close : () => {
    cal.hForm.classList.add("ninja");
  },

  // salva evento
  save : () => {
    cal.data[cal.sDay] = cal.hfTxt.value;
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    cal.list();
    return false;
  },

  // elimina evento
  del : () => { if (confirm("Eliminar nota?")) {
    delete cal.data[cal.sDay];
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    cal.list();
  }}
};
window.addEventListener("load", cal.init);

//contactos
function store(){ //armazena os dados
    var Fname = document.getElementById('Fname').value;
    var Lname = document.getElementById('Lname').value;
    var Num = document.getElementById('Num').value;

    const car = "nome: " + Fname + " " + Lname + " Número: " + Num;
    

    window.localStorage.setItem(Fname,JSON.stringify(car));  
    alert("Contacto guardado");
    //converte os valores de "car" (constante) para string
}
function retrieveRecords(){ //pega os dados da local storage
    var Fname = document.getElementById('retrieveNum').value; //recolhe o nome do utilizador
    var records = window.localStorage.getItem(Fname); //procura o nome nos contactos
    var paragraph = document.createElement("p");
    var infor = document.createTextNode(records);
    paragraph.appendChild(infor);
    var element = document.getElementById("retrieve");
    element.appendChild(paragraph);
}
function removeItem(){ //elimina o contacto 
    var Num = document.getElementById('removeNum').value; //pega  o nome do contacto
    localStorage.removeItem(Num) //elimina o contacto
    alert("Contacto eliminado");
    location.reload();
}
window.onload =function(){ //certifica que a página é carregada corretamente
    document.getElementById("NumForm").onsubmit = store
    document.getElementById("removeButton").onclick = removeItem
    document.getElementById("retrieveButton").onclick = retrieveRecords
}
