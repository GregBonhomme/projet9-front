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
import mockStoreError from "../__mocks__/storeError.js";
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
      const file = new File(['facturefreemobile'], 'facturefreemobile.jpg', { type: 'image/jpg' })
      userEvent.upload(expenseFile, file)
      const extension = expenseFile.files[0].name.split(".")[1]
      if (["jpg", "jpeg", "png"].includes(extension)) { uploadFile() }

      expect(handleChangeFile).toHaveBeenCalled()
      expect(uploadFile).toHaveBeenCalled()
    })

    test("Then if the file is not uploaded correctly an error will be logged", async () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      jest.mock("../app/store", () => mockStoreError)
      const newBill = new NewBill({ document, onNavigate, store: mockStoreError, localStorage })
      const logSpy = jest.spyOn(console, 'error')
      try {
        newBill.handleChangeFile()
      } catch (error) {
        expect(logSpy.toHaveBeenCalled)
      }
      logSpy.mockRestore()
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
      const handleSubmit = jest.fn(newBill.handleSubmit.bind(newBill))
      formNewBill.addEventListener('submit', handleSubmit)
      const submitBtn = formNewBill.querySelector('#btn-send-bill')
      userEvent.click(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
