/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, waitFor, screen} from '@testing-library/dom'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"


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
      expect(windowIcon).toHaveClass('active-icon')

    })
  })

  describe("When I am on Bills page and it's loading", () => {
    test("Then Loading page should be displayed", () => {
        const html = BillsUI({ data: bills, loading: true });
        document.body.innerHTML = html;
        const isLoading = screen.getAllByText("Loading...");
        expect(isLoading).toBeTruthy();
    })
  })
    
  describe("When I am on Bills page with an error", () => {
      test("Then Error page should be displayed", () => {
          const html = BillsUI({ data: bills, error: true });
          document.body.innerHTML = html;
          const hasError = screen.getAllByText("Erreur");
          expect(hasError).toBeTruthy();
      })
  }) 

  
  describe("When I am on Bills page, dates should be deplay from ealiest to latest", () => {
    test("Then, should return error",  () => {

      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01])[ ]\b.{3}\b[.][ ]\d{2}$/i).map(a => a.innerHTML);
      expect(dates).toEqual(['4 Avr. 04','3 Mar. 03','2 Fév. 02','1 Jan. 01'])
    })
  })

  
  describe("When I click on button 'Nouvelle note de frais'", () => {
    test("Then I should be sent on the new bill page", () => {
      
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
    
      const mockBills = new Bills({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store: null,
      });


      const btnNewBill = screen.getByTestId("btn-new-bill");
      
      //Mock fuction handle click
      const mockFunctionHandleClick = jest.fn(mockBills.handleClickNewBill);

      btnNewBill.addEventListener("click", mockFunctionHandleClick);
      fireEvent.click(btnNewBill);

      expect(mockFunctionHandleClick).toHaveBeenCalled();
     
    });
  });

  describe("When I click on first eye icon", () => {
    test("Then modal should open", () => {

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
       
      const billsContainer = new Bills({
          document,
          onNavigate,
          localStorage:localStorageMock,
          store: null,
      });

        //Mock the modal
        $.fn.modal = jest.fn();

        //Mock the handleClickIconeEye
        const handleClickIconEye = jest.fn(() => {
            billsContainer.handleClickIconEye
        });

        const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
        firstEyeIcon.addEventListener("click", handleClickIconEye);
        fireEvent.click(firstEyeIcon)

        expect(handleClickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
    });
  });
})

// Test d'integration GET
describe('Given I am connected as an employee', () => {
  
  describe('When I am on Bills Page', () => {

    test("fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      window.onNavigate(ROUTES_PATH.Bills)
     
      expect(await waitFor(() => screen.getByText('Mes notes de frais'))).toBeTruthy()
 
    })
  })

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a'}))
     const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error('Erreur 404'))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await waitFor(() => screen.getByText(/Erreur 404/))
      expect(message).toBeTruthy()
    })

    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error('Erreur 500'))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await waitFor(() => screen.getByText(/Erreur 500/))
      expect(message).toBeTruthy()
    })
  })
})