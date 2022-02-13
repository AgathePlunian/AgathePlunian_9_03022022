/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen, waitFor } from "@testing-library/dom"
 import NewBillUI from "../views/NewBillUI.js"
 import NewBill from "../containers/NewBill.js"
 import { bills } from "../fixtures/bills.js";
 import { ROUTES_PATH } from "../constants/routes.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import userEvent from "@testing-library/user-event";
 
 import router from "../app/Router.js";
 
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
     describe("When I am on NewBill Page and add new file", () => {
        test("Then when I add an image with extension jpg, png or jpeg", () => {
          // Build DOM for new bill page
          const html = NewBillUI();
          document.body.innerHTML = html;
    
          // Mock function handleChangeFile()
          const onNavigate = (pathname) => {
            document.body.innerHTML = pathname;
          };
          const newBill = new NewBill({
            document,
            onNavigate,
            store: null,
            localStorage: null
          });
    
          const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);
    
          const inputJustificative = screen.getByTestId("file");
          expect(inputJustificative).toBeTruthy();
    
          // Simulate if the file is an jpg extension
          inputJustificative.addEventListener("change", mockHandleChangeFile);
          fireEvent.change(inputJustificative, {
            target: {
              files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
            },
          });
    
          expect(mockHandleChangeFile).toHaveBeenCalled();
          expect(inputJustificative.files[0].name).toBe("file.jpg");
    
        });
      });

      describe("When I submit the form completed", () => {
        test("Then the bill is created", async() => {

            document.body.innerHTML = NewBillUI();

            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee',
                email: "azerty@email.com",
            }))

            const onNavigate = (pathname) => {
                document.body.innerHTML = pathname;
              };

            const newBill = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            })

            const validBill = {
                type: "Equipement et matériel",
                name: "Clavier-test",
                date: "2021-10-20",
                amount: 10,
                vat: 10,
                pct: 10,
                commentary: "Test",
                fileUrl: "../img/0.jpg",
                fileName: "test.jpg",
                status: "pending"
            };

            // Load the values in fields
            screen.getByTestId("expense-type").value = validBill.type;
            screen.getByTestId("expense-name").value = validBill.name;
            // ISO 8601
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
    
 })