# UI Test Cases for VietLedgr

## 1. Authentication & Authorization

### Test Case 1.1: Login Form - Successful Login
**Precondition**:  User has valid credentials (username: `admin`, password: `admin123`)

**Steps**:
1. Navigate to `/login`
2. Enter valid username
3. Enter valid password
4. Click "Login to Dashboard" button

**Expected Result**:
- User is redirected to `/dashboard`
- JWT token is stored in localStorage
- No error message is displayed

---

### Test Case 1.2: Login Form - Invalid Credentials
**Steps**:
1. Navigate to `/login`
2. Enter invalid username
3. Enter invalid password
4. Click login button

**Expected Result**:  Error message "Login failed.  Check your credentials." is displayed

---

### Test Case 1.3: Login Form - Password Visibility Toggle
**Steps**:
1. Navigate to `/login`
2. Enter password
3. Click the eye icon
4. Click the eye-off icon

**Expected Result**: Password visibility toggles between hidden and visible

---

### Test Case 1.4: Register Form - Successful Registration
**Precondition**: User has valid invite code

**Steps**:
1. Navigate to `/register`
2. Fill in all required fields (name, username, invite code, password, confirm password)
3. Check "I agree" checkbox
4. Click register button

**Expected Result**:  Account is created and user is redirected to login

---

### Test Case 1.5: Register Form - Password Mismatch
**Steps**: 
1. Enter different values in password and confirm password fields
2. Submit form

**Expected Result**: Error message "Passwords do not match" is displayed

---

### Test Case 1.6: Unauthorized Access Protection
**Precondition**: User is not logged in or has insufficient role

**Steps**:
1. Navigate to `/invite-code` or other manager-only page

**Expected Result**: User is redirected to `/unauthorized` page

---

## 2.  Sidebar Navigation

### Test Case 2.1: Sidebar Section Expansion
**Steps**:
1. Log in successfully
2. Click on "Inventory" section header
3. Verify section expands
4. Click again to collapse

**Expected Result**: Section toggles between expanded and collapsed states

---

### Test Case 2.2: Active Route Highlighting
**Steps**: 
1. Navigate to `/products`
2. Check if "Inventory" section is auto-expanded
3. Check if "Products" item is highlighted

**Expected Result**: Current route's section is expanded and item is highlighted

---

### Test Case 2.3: Navigation Between Pages
**Steps**:
1. Click on different menu items (Dashboard Report, Products, Sales Management, etc.)

**Expected Result**: User is navigated to correct page for each menu item

---

## 3. Dashboard

### Test Case 3.1: Dashboard Metrics Display
**Steps**:
1. Navigate to `/dashboard`

**Expected Result**:
- Revenue, profit, and other KPI cards are displayed
- Charts/graphs render correctly
- No loading spinners remain visible

---

### Test Case 3.2: Dashboard - Expiring Stock Alert
**Steps**:
1. View dashboard
2. Locate "Expiring in 7 Days" section

**Expected Result**:  Products near expiry are listed with warning styling (red background)

---

### Test Case 3.3: Dashboard - AI Inventory Recommendations
**Steps**: 
1. View dashboard
2. Locate "AI Inventory Retrieval" section

**Expected Result**:  AI recommendations are displayed with confidence scores

---

## 4. Product Management

### Test Case 4.1: Products List - View All Products
**Steps**:
1. Navigate to `/products`

**Expected Result**:  Table of products is displayed with SKU, name, category, price, stock columns

---

### Test Case 4.2: Add Product - Successful Creation
**Steps**:
1. Navigate to `/products/add-product`
2. Fill in product name, SKU, description
3. Upload product images
4. Set price, tax, and stock quantity
5. Click "Add Product"

**Expected Result**:
- Product is created in database
- User is redirected to products list
- Success message is shown

---

### Test Case 4.3: Add Product - Image Upload
**Steps**:
1. Navigate to add product page
2. Click file input to upload images
3. Select multiple image files
4. Verify previews appear
5. Remove an image using "×" button

**Expected Result**:
- Multiple images can be uploaded
- Image previews are displayed (24x24 thumbnails)
- Images can be removed individually

---

### Test Case 4.4: Add Product - Required Field Validation
**Steps**: 
1. Navigate to add product page
2. Leave required fields empty
3. Click submit

**Expected Result**:  Validation errors are displayed for empty required fields

---

## 5. Point of Sale (POS)

### Test Case 5.1: POS - Product Search
**Steps**:
1. Navigate to `/pos`
2. Enter product name in search field

**Expected Result**: Product list is filtered to match search query

---

### Test Case 5.2: POS - Add to Cart
**Steps**:
1. Select a warehouse
2. Click on a product card

**Expected Result**:
- Product is added to cart
- Cart item count increases
- Subtotal updates

---

### Test Case 5.3: POS - Adjust Cart Quantity
**Steps**:
1. Add product to cart
2. Use +/- buttons to adjust quantity

**Expected Result**:
- Quantity updates
- Line total recalculates
- Overall subtotal updates

---

### Test Case 5.4: POS - Remove from Cart
**Steps**: 
1. Add product to cart
2. Click remove/delete button

**Expected Result**:  Product is removed from cart

---

### Test Case 5.5: POS - Select Payment Method
**Steps**: 
1. Add products to cart
2. Select "Bank Transfer" payment method

**Expected Result**:
- Payment method is selected
- QR code is generated (if applicable)

---

### Test Case 5.6: POS - Complete Sale
**Steps**:
1. Add products to cart
2. Enter customer name
3. Select payment method
4. Click "Complete Sale" or checkout button

**Expected Result**: 
- Sale is recorded
- Invoice is generated
- Cart is cleared

---

### Test Case 5.7: POS - Print Invoice
**Steps**:
1. Complete a sale
2. Click print button

**Expected Result**: Invoice print dialog appears with formatted receipt

---

## 6. Invite Code Management (Manager Only)

### Test Case 6.1: View Invite Codes
**Precondition**: User has ADMIN or MANAGER role

**Steps**:
1. Navigate to `/invite-code`

**Expected Result**:
- List of invite codes is displayed
- Columns: Code, Role, Created Date, Status, Actions

---

### Test Case 6.2: Create New Invite Code
**Steps**:
1. Navigate to `/invite-code/new`
2. Select role (Admin/Manager/Cashier)
3. Click "Generate Code"

**Expected Result**:
- New invite code is created
- Code is displayed to user
- User is redirected to invite code list

---

### Test Case 6.3: Invite Code - Loading State
**Steps**: 
1. Navigate to `/invite-code`
2. Observe initial load

**Expected Result**: Loading spinner or skeleton is shown while fetching data

---

### Test Case 6.4: Invite Code - Error Handling
**Precondition**: Backend is unavailable

**Steps**:
1. Navigate to `/invite-code`

**Expected Result**: Error message is displayed to user

---

## 7. Ledger & Accounting

### Test Case 7.1: General Ledger - View Entries
**Steps**:
1. Navigate to `/ledger`

**Expected Result**:
- Table of ledger entries is displayed
- Columns include Date, Account, Debit, Credit, Balance

---

### Test Case 7.2: Ledger - Empty State
**Steps**:
1. Navigate to ledger page with no data

**Expected Result**:
- Empty state message is shown
- "No ledger data found for this store" text is displayed
- Refresh icon is visible

---

### Test Case 7.3: Ledger - Loading State
**Steps**:
1. Navigate to ledger page
2. Observe loading behavior

**Expected Result**: 
- Refresh icon animates (spinning)
- "Loading financial records..." message is shown

---

## 8. Responsive Design & UI Components

### Test Case 8.1: Header Component
**Steps**:
1. Navigate to any page with Header component

**Expected Result**:
- Page name is displayed in large bold text
- Description text is shown below in gray

---

### Test Case 8.2: Empty State Component
**Steps**:
1. View a page with no data

**Expected Result**:
- Empty state component is rendered
- Icon/media is displayed
- Title and description are shown

---

### Test Case 8.3: Button Variants
**Steps**:
1. Test different button variants (default, destructive, outline, ghost, link)
2. Test different sizes (default, sm, lg, icon)

**Expected Result**: All button styles render correctly with proper colors and spacing

---

### Test Case 8.4: Mobile Responsiveness
**Steps**:
1. Resize browser to mobile width (< 768px)
2. Navigate through different pages

**Expected Result**:
- Sidebar collapses or becomes mobile-friendly
- Tables are scrollable
- Forms remain usable

---

## 9. Error Handling

### Test Case 9.1: Backend Connection Error
**Precondition**: Backend server is down

**Steps**: 
1. Attempt to login
2. Attempt to fetch products

**Expected Result**: User-friendly error message "Cannot connect to the backend server" is displayed

---

### Test Case 9.2: Form Validation Errors
**Steps**: 
1. Submit forms with invalid data

**Expected Result**:
- Validation errors are displayed inline
- Red styling highlights error fields
- Submit button remains disabled until errors are fixed

---

## 10. Data Persistence

### Test Case 10.1: Remember Me Checkbox
**Steps**: 
1. Check "Remember Me" on login
2. Log in successfully
3. Close browser
4. Reopen and navigate to site

**Expected Result**: User session is persisted

---

### Test Case 10.2: LocalStorage Token
**Steps**:
1. Log in successfully
2. Open browser DevTools
3. Check localStorage for 'token' key

**Expected Result**: JWT token is stored in localStorage

---

## Summary

These test cases cover: 
- ✅ **Authentication flows** (login, register, authorization)
- ✅ **Navigation** (sidebar, routing)
- ✅ **Core features** (products, POS, ledger, invite codes)
- ✅ **UI components** (forms, buttons, empty states, headers)
- ✅ **Error handling** and loading states
- ✅ **Responsive design**

---

**Total Test Cases**: 37

**Last Updated**: 2026-01-06