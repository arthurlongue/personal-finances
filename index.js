function createTransactionContainer(id) {
  const container = document.createElement("div")
  container.classList.add("transaction")
  container.id = `transaction-${id}`
  return container
}

function createTransactionTitle(name) {
  const title = document.createElement("span")
  title.classList.add("transaction-title")
  title.textContent = name
  return title
}

function createTransactionAmount(amount, id) {
  const span = document.createElement("span")
  span.classList.add("transaction-amount")
  const formater = numberFormater()
  const formatedAmount = formater.format(amount)
  valueChecker(amount, span, formatedAmount)
  return span
}

function numberFormater() {
  return Intl.NumberFormat("pt-BR", {
    compactDisplay: "long",
    currency: "BRL",
    style: "currency",
  })
}

function renderTransaction(transaction) {
  const container = createTransactionContainer(transaction.id)
  const title = createTransactionTitle(transaction.name)
  const amount = createTransactionAmount(transaction.amount)
  const editBtn = createEditTransactionBtn(transaction)
  const deleteBtn = createDeleteTransactionBtn(transaction.id)

  document.querySelector("#transactions").append(container)
  container.append(title, amount, editBtn, deleteBtn)
}

async function fetchTransactions() {
  return await fetch("http://localhost:3000/transactions").then((res) => res.json())
}

function editTransaction(name, amount, id) {
  const spanAmount = document.querySelector(`#transaction-${id}`).childNodes[1]
  const spanName = document.querySelector(`#transaction-${id}`).childNodes[0]
  spanName.textContent = name

  const formater = numberFormater()
  const formatedAmount = formater.format(amount)
  valueChecker(amount, spanAmount, formatedAmount)
}

function valueChecker(amount, spanAmount, formatedAmount) {
  if (amount > 0) {
    spanAmount.textContent = `${formatedAmount} C`
    spanAmount.classList.add("credit")
    spanAmount.classList.remove("debit")
  } else {
    spanAmount.textContent = `${formatedAmount} D`
    spanAmount.classList.add("debit")
    spanAmount.classList.remove("credit")
  }
}

async function updateBalance() {
  const balanceSpan = document.querySelector("#balance")
  let sum = 0
  const balance = await fetch("http://localhost:3000/transactions").then((res) => res.json())
  balance.forEach((transaction) => {
    let amount = transaction.amount

    if (amount >= 0) {
      sum += Number(amount)
    } else {
      sum -= Number(amount * -1)
    }
  })
  const formater = numberFormater()
  balanceSpan.textContent = formater.format(sum)
  /* console.log(sum) */
}

async function setup() {
  const results = await fetchTransactions()
  results.forEach(renderTransaction)
  updateBalance()
}

document.addEventListener("DOMContentLoaded", setup)

async function saveTransaction(ev) {
  ev.preventDefault()

  let id = document.querySelector("#id").value
  const name = document.querySelector("#name").value
  const amount = parseFloat(document.querySelector("#amount").value)

  if (id) {
    await fetch(`http://localhost:3000/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, amount, id }),
    })
    editTransaction(name, amount, id)
    document.querySelector("#id").removeAttribute("value")
  } else {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      body: JSON.stringify({ name, amount }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    const transaction = await response.json()
    renderTransaction(transaction)
  }
  ev.target.reset()
  updateBalance()
}

document.addEventListener("DOMContentLoaded", setup)
document.querySelector("form").addEventListener("submit", saveTransaction)

function createEditTransactionBtn(transaction) {
  const editBtn = document.createElement("button")
  editBtn.classList.add("edit-btn")
  editBtn.textContent = "Editar"
  editBtn.addEventListener("click", async () => {
    const response = await fetch(`http://localhost:3000/transactions/${transaction.id}`).then((res) => res.json())
    document.querySelector("#id").value = response.id
    document.querySelector("#name").value = response.name
    document.querySelector("#amount").value = response.amount
  })
  return editBtn
}

function createDeleteTransactionBtn(id) {
  const deleteBtn = document.createElement("button")
  deleteBtn.classList.add("delete-btn")
  deleteBtn.textContent = "Excluir"
  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/transactions/${id}`, { method: "DELETE" })
    deleteBtn.parentElement.remove()
    updateBalance()
  })
  return deleteBtn
}
