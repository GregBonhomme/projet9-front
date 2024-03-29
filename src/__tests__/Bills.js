/**
 * @jest-environment jsdom
 */
import { expect } from "@jest/globals";
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import mockStoreError from "../__mocks__/storeError.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.getAttribute("class")).toContain("active-icon")
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given I am connected as an Employee and i am on Bills page", () => {
  describe("When I click on the eye icon of a bill", () => {
    test("Then a modal should open", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsList = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
      const eyes = screen.getAllByTestId('icon-eye')
      const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eyes[0]))
      eyes[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eyes[0])
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = screen.getByTestId('modal-img')
      expect(modale).toBeTruthy()
    })
  })
  describe("When I click on the 'New Bill' button", () => {
    test("Then a new bill modal should open", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsList = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
      const newBillBtn = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn(billsList.handleClickNewBill())
      newBillBtn.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled()
      const newBillModal = screen.getByTestId('form-new-bill')
      expect(newBillModal).toBeTruthy()
    })
  })
  describe("When for some reason the data is corrupted", () => {
    test("Then the error is logged", async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      jest.mock("../app/store", () => mockStoreError)
      const billsList = new Bills({
        document, onNavigate, store: mockStoreError, bills, localStorage: window.localStorage
      })
      const logSpy = jest.spyOn(console, 'error')
      try {
        await billsList.getBills()
      } catch (error) {
        expect(logSpy.toHaveBeenCalled)
      }
      logSpy.mockRestore()
    })
  })
})


describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then all my bills are displayed", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const billsList = screen.getByTestId("tbody").childNodes
      expect(billsList).toBeTruthy()
    })
  })
})