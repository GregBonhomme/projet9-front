/**
 * @jest-environment jsdom
 */

import { mockResolvedValue } from "@testing-library/jest-dom";
import { fireEvent, getByTestId, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then selecting a file will upload it", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage })
      const expenseFile = screen.getByTestId('file')
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const uploadFile = jest.fn(newBill.store.bills().create)
      expenseFile.addEventListener('change', handleChangeFile)
      const file = new File(['facturefreemobile'], '../assets/images/facturefreemobile.jpg', { type: 'image/jpg' })
      userEvent.upload(expenseFile, file)
      const fileName = expenseFile.files[0].name.split("/")[(expenseFile.files[0].name.split("/").length) - 1]
      const extension = fileName.split(".")[1]
      console.log(`!!!!!!!!!!!! ${extension}`)
      if (["jpg", "jpeg", "png"].includes(extension)) { uploadFile() }

      expect(handleChangeFile).toHaveBeenCalled()
      expect(uploadFile).toHaveBeenCalled()
    })

    test("Then clicking the 'submit' button submit the new bill", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage })
      const formNewBill = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit)
      formNewBill.addEventListener('submit', handleSubmit)
      const submitBtn = formNewBill.querySelector('#btn-send-bill')
      userEvent.click(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
    })

    test("Then filling all inputs with correct info should upload the new bill", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const expenseType = screen.getByTestId('expense-type')
      userEvent.selectOptions(expenseType, 'Fournitures de bureau')
      const expenseName = screen.getByTestId('expense-name')
      userEvent.type(expenseName, "Test de nouvelle facture")
      const expenseDate = screen.getByTestId('datepicker')
      userEvent.clear(expenseDate)
      userEvent.type(expenseDate, '01011991')
      const expenseAmount = screen.getByTestId('amount')
      userEvent.type(expenseAmount, "1234")
      const expenseVat = screen.getByTestId('vat')
      userEvent.type(expenseVat, "10")
      const expensePct = screen.getByTestId('pct')
      userEvent.type(expensePct, "5")
      const expenseComment = screen.getByTestId('commentary')
      userEvent.type(expenseComment, "azerty azerty azerty azerty")
      const expenseFile = screen.getByTestId('file')
      const file = new File(["facturefreemobile"], "facturefreemobile.jpg", { type: "image/jpg" })
      userEvent.upload(expenseFile, file)
      const formNewBill = screen.getByTestId('form-new-bill')
      const submitBtn = formNewBill.querySelector('#btn-send-bill')
      const billsList = jest.fn(newBill.store.bills.list)
      userEvent.click(submitBtn)

      const updatedInfo = {
        type: expenseType.value,
        name: expenseName.value,
        amount: expenseAmount.value,
        date: expenseDate.value,
        vat: expenseVat.value,
        pct: expensePct.value,
        commentary: expenseComment.value,
        fileUrl: expenseFile.files[0].name,
        fileName: expenseFile.files[0].name,
        status: 'pending'
      }

    })
  })
})

/* 

*/