/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
   describe("When I am on NewBill Page", () => {
      test("Then mail icon in vertical layout should be highlighted", async() => {

         Object.defineProperty(window, 'localStorage', { value: localStorageMock })
         window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
         }))

         const root = document.createElement("div")
         root.setAttribute("id", "root")
         document.body.append(root)
         router()
         window.onNavigate(ROUTES_PATH.NewBill)
         await waitFor(() => screen.getByTestId('icon-mail'))
         const windowIcon = screen.getByTestId('icon-mail')
         const iconActivated = windowIcon.classList.contains('active-icon')
         expect(iconActivated).toBeTruthy()
      })
   })
   
   //ON NEWBILL PAGE, THE FORM SHOULD BE LOADED
   describe("When I am on NewBill Page", () => {
      test("Then the new bill's form should be loaded with its fields", () => {
          const html = NewBillUI()
          document.body.innerHTML = html
          expect(screen.getByTestId("form-new-bill")).toBeTruthy();
          expect(screen.getByTestId("expense-type")).toBeTruthy();
          expect(screen.getByTestId("expense-name")).toBeTruthy();
          expect(screen.getByTestId("datepicker")).toBeTruthy();
          expect(screen.getByTestId("amount")).toBeTruthy();
          expect(screen.getByTestId("vat")).toBeTruthy();
          expect(screen.getByTestId("pct")).toBeTruthy();
          expect(screen.getByTestId("commentary")).toBeTruthy();
          expect(screen.getByTestId("file")).toBeTruthy();
          expect(screen.getByRole("button")).toBeTruthy();
      })

      
      test('Then I can select upload an image file', () => {   
             
         window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
         }
         const html = NewBillUI()
         document.body.innerHTML = html
         const newBill = new NewBill({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
         })
        
         const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
         const selectFile = screen.getByTestId('file')
         const testFile = new File(['AcceptedFile'], 'acceptedFile.jpg', {
            type: 'image/jpeg',
         })
   
         selectFile.addEventListener('change', handleChangeFile)
         fireEvent.change(selectFile, { target: { files: [testFile] } })
   
         expect(handleChangeFile).toHaveBeenCalled()
         expect(selectFile.files[0]).toStrictEqual(testFile)
      })

      test("Then I can't select upload a non image file", () => {
          //MOCK WINDOW'S ALERT   
         window.alert = jest.fn()
         
         window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
         const onNavigate = (pathname) => {
           document.body.innerHTML = ROUTES({ pathname })
         }
         const html = NewBillUI()
         document.body.innerHTML = html
         const newBill = new NewBill({
           document,
           onNavigate,
           store: null,
           localStorage: window.localStorage,
         })
         const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
         const selectFile = screen.getByTestId('file')
         const testFile = new File(['Wrong file'], 'wrongFile.pdf', {
           type: 'application/pdf',
         })
   
         selectFile.addEventListener('change', handleChangeFile)
         fireEvent.change(selectFile, { target: { files: [testFile] } })
   
         expect(handleChangeFile).toHaveBeenCalled()
         expect(window.alert).toHaveBeenCalled()
      })
   })
})


 
//Test d'intégration POST
describe('Given I am a user connected as Employee', () => {
   describe("When I submit the form completed", () => {
      test("Then the bill is created", async() => {

         const html = NewBillUI()
         document.body.innerHTML = html
         
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({pathname});
         };

         Object.defineProperty(window, 'localStorage', { value: localStorageMock })
         window.localStorage.setItem('user', JSON.stringify({
               type: 'Employee',
               email: "azerty@email.com",
         }))

         const newBill = new NewBill({
               document,
               onNavigate,
               store: null,
               localStorage: window.localStorage,
         })

         const validBill = {
               type: "Restaurants et bars",
               name: "Vol Paris Londres",
               date: "2022-02-15",
               amount: 200,
               vat: 70,
               pct: 30,
               commentary: "Commentary",
               fileUrl: "../img/0.jpg",
               fileName: "test.jpg",
               status: "pending"
         };

         // Load the values in fields
         screen.getByTestId("expense-type").value = validBill.type;
         screen.getByTestId("expense-name").value = validBill.name;
         screen.getByTestId("datepicker").value = validBill.date;
         screen.getByTestId("amount").value = validBill.amount;
         screen.getByTestId("vat").value = validBill.vat;
         screen.getByTestId("pct").value = validBill.pct;
         screen.getByTestId("commentary").value = validBill.commentary;

         newBill.fileName = validBill.fileName
         newBill.fileUrl = validBill.fileUrl;

         newBill.updateBill = jest.fn();
         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

         const form = screen.getByTestId("form-new-bill");
         form.addEventListener("submit", handleSubmit);
         expect(screen.getByText('Envoyer').type).toBe('submit')

         userEvent.click(screen.getByText("Envoyer"))

         expect(handleSubmit).toHaveBeenCalled()
         expect(newBill.updateBill).toHaveBeenCalled()
         
      })
   })
      
      describe("When an error occurs on API", () => {
         beforeEach(() => {
           jest.spyOn(mockStore, "bills")
           Object.defineProperty(
               window,
               'localStorage',
               { value: localStorageMock }
           )

           window.localStorage.setItem('user', JSON.stringify({
             type: 'Employee',
             email: "a@a"
           }))
           const root = document.createElement("div")
           root.setAttribute("id", "root")
           document.body.appendChild(root)
           router()
         })
         
         test("fetches bills from an API and fails with 404 message error", async () => {
     
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error("Erreur 404"))
               }
             }})
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick);
           const message = await screen.getByText(/Erreur 404/)
           expect(message).toBeTruthy()
         })
     
         test("fetches messages from an API and fails with 500 message error", async () => {
     
           mockStore.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error("Erreur 500"))
               }
             }})
     
           window.onNavigate(ROUTES_PATH.Bills)
           await new Promise(process.nextTick);
           const message = await screen.getByText(/Erreur 500/)
           expect(message).toBeTruthy()
         })
   })

})
