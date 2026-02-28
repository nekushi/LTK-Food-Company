Project: LTK FOOD COMPANY

Styling: use the current color palette

Typescript: refrain from using `any` type or `as any` casting

Database: Prisma + Supabase

To-Do's
[x] - /inventory/page.tsx. create a dashboard based on the adjacent paths
[x] - /inventory/page.tsx. create a feature where page.tsx has notifications subscribed with if someone has inserted and item to the RequestedItems
[x] - /inventory/page.tsx. read my prisma/schema.prisma for requestId reference. make the requested appear permanently by creating a function under `dal` directory. dont use their `ID` like `Store: 7gf6ds-dsaddsc...`
[x] - /inventory/page.tsx. create a delete button for each request to avoid over population. separate the `total request` and `new request`. highlight the new request
[x] - /store/request-items/page.tsx, prisma/schema.prisma, dal/inventory/request-items.ts. make the requested items belong to only one store. they should not appear as separate items, like `{"store1": "item1", "store1": "item2" }`, it should be `{"store1": ["item1", "item2"]}` so it only belongs to the user. fix the notification from /inventory/page.tsx to look like just the given example. modify what is needed to be modify
[x] - /inventory/page.tsx. ive added a new field under the `RequestedItems`, the `isRequestApproved Boolean` and `note String (optional)`. add an `accept request` button and `reject request` button along with the `name of the store` that made the request. upon clicking either button, create a modal that enables the `/inventory` user to add note that will reflect on `/store` account. under `dal` directory, notify the `store` that made the request if their request is approved or not. both the accepted request and the rejected request will reflect on `/inventory/history` and the store that made the request will also reflect both accepted and rejected request under `/store/history`
[x] - /inventory/items-flow/page.tsx. create a feature where if the `issued stocks` is selected, it will reference to the `store's requested items`, update the value in the db where `current quantity = current quantity minus the requested quantity`. also, open a modal that takes a `note` and update the `isRequestedApproved` to true for the `RequestedItems` db
[x] - /inventory/items-flow/page.tsx. fixed where if we update the quantity of an item in the database and it reaches to 0, it will automatically be removed to the database and cant be seen by the /store/request-items/page.tsx either
[x] - /inventory/items-flow/page.tsx. create a feature where if inventory selected the `type of stocks - additional stocks`, it will update the value of the same item that is a `beginning stock`. basically, what will be updated is mostly the `quantity`, `type of stocks`, but just like `issued stocks`, also fill up all the input fields depending on the selected
[x] - /inventory/items-flow/page.tsx. update the `additional stocks` function: reference both the `beginning stocks` and the `additional stocks` to be updated when the inventory selected the `additional stocks` radio button
[x] - /inventory/delivery/page.tsx. ive created delivery page under inventory. insert a ui that references the issued stocks for the issued items to be delivered
[x] - /inventory/delivery/page.tsx. add an additional box section that has a `Off for Delivery` button (no function yet). add a button along with the store name, of the other box section, that puts the items, under the selected store, to the box that i want to be created.
[x] - /store/history/page.tsx. ive added a new field for `RequestedItems` model, `deliveryStatus`. update the function of the `/inventory/items-flow/`, `issued stock` button, that updates the deliveryStatus to `to be delivered`, `on the way`, `success`. `to be delivered` for issued stock button, `on the way` for `Off for Delivery` button, and we settle the `success` later
[x] - /inventory/history/page.tsx. in table, add deliveryStatus above and fetch its values
[x] - /inventory/delivery/page.tsx. fix the issue where different stores overlap. only selected store should reflect on the delivery box, and updates the `destination` and `Store name`
[x] - /inventory/delivery/page.tsx, /inventory/delivery/map.txt, schema.prisma. read the `map.txt`. ive created new schema called `Location`. on the other hand. `map.txt` has the code on my other file that i migrated. i want you to use it as reference, and add a map under the map section in /inventory/delivery/page.tsx. add the required endpoints for missing map functions
[x] - /delivery/page.tsx. reference for `/inventory/delivery/page.tsx` that carries the items for the store, the destination, and the store name. add a button that has `Start GPS` to start tracking the location. auto stop the GPS and alert if the delivery is within a hundred meters away from the destination. after successful delivery, `on the way` will become `success`. add a stop button as optional for immediate stop
[x] - /inventory/delivery. ive added my own map inside /components/delivery-map. use it as map component, retain the logic for `add items for delivery` function. just use my Map under /components/delivery-map. also install missing package for `AutoFollow.tsx` component
[x] - /delivery/page.tsx. update `app/delivery/page.tsx`. use the map under `/components/delivery-map/Map.tsx` for map reference. just render it
[x] - /api/location, /delivery/page.tsx, /components/delivery-map/MapDelivery.tsx. ive made some changes to these file. use the `startTracking` function and the `stopTracking` button of the `MapDelivery.tsx` in `DeliveryRunClient.tsx` as their function. use the map under `MapDelivery.tsx`, and pass location props in `getLocation` and `postLocation` of `DeliveryRunClient.tsx`
[x] - /delivery/DeliveryRunClient.tsx. fix `hasDestination` variable. use the `store` location of the store account inside store db
[x] - /delivery/DeliveryRunClient.tsx. fix the `getLocation` function. fetch from the `/api/location/post-location` instead of `/api/location`. also, ive added new props for the `DeliveryMapComponent`. have it access and pass down to the `AutoFollow` component, and use it as the destination for dynamic destination
[x] - /delivery/DeliveryRunClient.tsx. fix the map where the coordinates doesnt reflect on map; map doesnt render
[x] - prisma/schema.prisma. ive added some models in prisma schema file. check for errors. the flow i want is `row data for list of employees => clickable rows to be redirected to their own profile page => page should have their remaining data like sss, pagibig, etc. and below is the JSON datawe will get later`
[x] - /hr/employees/, schema.prisma. ive address an `address` field to my `employeeSchema` zod, and ive created `Employee` model in `schema.prisma`. read. i want you to create a function under `dal/create-employee/` that add a new employee under the form `HREmployeeForm` of `hr/employees/create-employee/page.tsx`
[x] - /hr/employees/page.tsx. create a function where we fetch data created by the `create-employee` form. each row should be clickable and will be redirected to their own dynamic route for profiling based on their id. for example: `hr/employees/[id]` => `hr/employees/safbhaksjfassfanc`
[x] - /hr/payrolls/page.tsx. reference from `/hr/payroll/excel`. i have there an endpoint for excel to json of `GEO` and `PILA`. re-theme the excel page, use it for `api/excel/geo` and `api/excel/pila`, and apply it on `/hr/payrolls/page.tsx`
[x] - /hr/payrolls - pila. notice that `pila` has JSON.stringify as an output, unlike the `geo` that has a card format. make it just like `geo` with same theme. unlike `geo` that has a fix 6 data per date, `pila` sometimes reach up to 7 or 8. do it. it is an array, and it has the shape of this:

{
"id": "1",
"name": "BRYAN MARIANO",
"role": "CREW",
"schedules": [
{
"16": {
"values": null
}
},
{
"17": {
"values": null
}
},
{
"18": {
"values": null
}
},
{
"19": {
"values": null
}
},
{
"20": {
"values": null
}
},
{
"21": {
"values": null
}
},
{
"22": {
"values": null
}
},
{
"23": {
"values": null
}
},
{
"24": {
"values": null
}
},
{
"25": {
"values": null
}
},
{
"26": {
"values": null
}
},
{
"27": {
"values": null
}
},
{
"28": {
"values": null
}
},
{
"29": {
"values": null
}
},
{
"30": {
"values": null
}
},
{
"31": {
"values": null
}
},
{
"1": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
},
{
"null": {
"values": null
}
}
]
},

[x] - /hr/payrolls/page.tsx. excel. notice `geo` table, it has "---" or "NaN:NaN". make every row clickable and allow edits only to the values with "---" or "NaN:NaN" value
[x] - /hr/payrolls/page.tsx. excel. create a function that will calculate the total hours worked by the employee. use the `workDataMonth.tsx` as reference. details below:

Valid entries: 14:23, 07:43, 00:00
Invalid entries: --:--, NaN:NaN

Input: odd number entries
Output: Cant be calculate, unless "---" has been edited to make them even

Morning in:

- can be invalid entries
- case1: 04:53 => 05:00
- case2: 05:00 => 05:00
- case3: 05:03 => 05:03 => 3 minutes late = store lates on tardiness field
- case4: 05:05 => 05:05 => 5 minutes late = store lates on tardiness field
- case5: 05:06 => 05:06 => 60 minutes late. beyond 5 minutes late will be converted to 1 hour = store lates on tardiness field
  Morning out:
- can be invalid entries
- no time alterations
  Afternoon in:
- can be invalid entries
- no time alterations. should be an hour after morning out. any delay will be counted as late = store lates on tardiness field
  Afternoon out:
- can be invalid entries
- no time alterations
  Overtime in:
- can be invalid entries
- no time alterations. should be an hour after afternoon out. any delay will be counted as late = store lates on tardiness field
  Overtime out:
- can be invalid entries
- no time alterations

Input: "in_out": {
"morning": {
"morning_in": "08:00",
"morning_out": "12:00"
},
"afternoon": {
"afternoon_in": "13:00",
"afternoon_out": "17:00"
},
"overtime": {
"overtime_in": null,
"overtime_out": null
}
}
Output: 8 hours

Input: "in_out": {
"morning": {
"morning_in": "08:00",
"morning_out": "12:00"
},
"afternoon": {
"afternoon_in": "13:00",
"afternoon_out": "17:00"
},
"overtime": {
"overtime_in": "17:00",
"overtime_out": "18:00"
}
}
Output: 9 hours

Input: "in_out": {
"morning": {
"morning_in": "08:03", => 08:03
"morning_out": "12:00"
},
"afternoon": {
"afternoon_in": "13:03", => 13:03
"afternoon_out": "17:00"
},
"overtime": {
"overtime_in": null,
"overtime_out": null
}
}
Output: 8 hours - tardiness: 6 minutes => you should deduct the tardiness from the total hours

Input: "in_out": {
"morning": {
"morning_in": "08:06", => 09:00
"morning_out": "12:00"
},
"afternoon": {
"afternoon_in": "13:06", => 13:06
"afternoon_out": "17:00"
},
"overtime": {
"overtime_in": "17:00",
"overtime_out": "18:00"
}
}
Output: 9 hours - tardiness: 66 minutes => you should deduct the tardiness from the total hours

Input: "in_out": {
"morning": {
"morning_in": "07:45", => 08:00
"morning_out": "12:00"
},
"afternoon": {
"afternoon_in": "12:45", => 13:00
"afternoon_out": "17:00"
},
"overtime": {
"overtime_in": "17:00",
"overtime_out": "18:00"
}
}
Output: 9 hours

Input: "in_out": {
"morning": {
"morning_in": "08:51",
"morning_out": "08:51" => total morning in and out is 0. if you round the `in` and the `out` is less than or equal to the rounded up `in`, return 0
},
"afternoon": {
"afternoon_in": "9:52", => 1min late
"afternoon_out": "14:13"
},
"overtime": {
"overtime_in": null,
"overtime_out": null
}
}
Output: 4 hours and 12 minutes - tardiness: 1 minutes => you should deduct the tardiness from the total hours

Input: "in_out": {
"morning": {
"morning_in": "14:57",
"morning_out": "16:30"
},
"afternoon": {
"afternoon_in": "17:29",
"afternoon_out": "01:29" => convert to 25:29. if the hour is reset by the 24hour day reset, expand up until 48hours
},
"overtime": {
"overtime_in": null,
"overtime_out": null
}
}
Output: idk, you compute. should not return negative value

[x] - upon calculating the total hours, add new table header called "Total Hours", and display the total hours there. display only the total hours in minute format. e.g. 480, 1234. a click will show an alert of the total hours in full format
[x] - if valid entries count is odd number,no changes to the --- value in total hours. if valid entries count is even number, calculate the total hours and display it in the total hours column. only the minute, so it is a number field
[x] - create new metric card for the sum of all valid total hours. for example. i only calculated for 3 rows: 480, 1234, 749. the sum is 2463 minutes. display it in the metric card. a click will show an alert of the total hours in full format

<!-- [ ] - create a new metric card for salary. formula will be implemented later -->

[x] - /store. create a /report directory and create a page.tsx file. base on the /store contents, create a form for sales report that has the update for every month
[x] - /store/sales-report/page.tsx. create a sales-report that has a form for sales report that takes the update for every month. data will be redirected to /store/page.tsx as dashboard
[x] - /admin/page.tsx. create an /admin/page.tsx that has a sidebar(Dashboard, Branch Management(submenu: Overview, Inventory, Reports), Personnel Management(submenu: HR, Staff, Store), Employee Management(submenu: Employees, Create Employee, Attendance Card), Logout)
[x] - /admin/personnel/hr/page.tsx. allow admin to create new account with the same functionality as /hr/accounts/create-account instead of /hr/employees/create-employees. create account like /hr/accounts/create-account. not only for "HR" but also for "Staff" and "Store"
[x] - /admin/personnel/hr/page.tsx. create a table that displays the list of all accounts. allow admin to edit and delete the accounts same UI like /hr/accounts.
[x] - /admin/. do the folder structure below: renaming is possible. refenrence the names based on this file system.

ADMIN DASHBOARD
│
├── 📊 Dashboard (Home)
│ ├── KPI Overview (all branches)
│ ├── Alerts & Notifications
│ └── Quick Stats (Sales, Inventory, Staff)
│
├── 🏪 Branch Management
│ ├── Branch Overview
│ │ ├── Branch List (with status: Active/Inactive)
│ │ ├── Branch Profile (location, contact, manager)
│ │ └── Branch Performance Snapshot
│ ├── Inventory
│ │ ├── Per-Branch Inventory View
│ │ ├── Low Stock Alerts
│ │ ├── Inventory Transfer Requests (Approve/Reject)
│ │ └── Reorder Management
│ └── Requests & Approvals
│ ├── Inventory Requests
│ ├── Staff Requests (hiring, transfer)
│ └── Budget/Purchase Requests
│
├── 👥 Personnel Management
│ ├── HR
│ │ ├── Employee Records (all branches)
│ │ ├── Attendance & Scheduling
│ │ ├── Payroll Overview
│ │ └── Disciplinary Records
│ ├── Branch Managers
│ │ ├── Manager Profiles
│ │ ├── Performance Reviews
│ │ └── Assignment per Branch
│ └── Staff
│ ├── Staff Directory (filterable by branch)
│ ├── Role Management
│ └── Transfer / Deployment
│
├── 📋 Reports
│ ├── Custom Reports
│ ├── Sales Reports (per branch / overall)
│ ├── Inventory Reports
│ ├── Staff Performance Reports
│ └── Compliance Reports
│
└── ⚙️ Settings
├── Admin Accounts & Roles
├── Branch Registration
└── System Configuration

[x] - /store/history/page.tsx. we have 2 tables below. use the first table inside the second table. remove dummy data
[x] - /store/history/page.tsx. fetch the deliveryStatus and add it to the table field
[x] - /inventory/history/page.tsx. do the same as /store/history/page.tsx
[x] - /ivnentory/items/page.tsx. remove the beginning, additional, issued stocks metric cards. create a new metric cards for different account recognitions. office supplies, operational supplies, janitorials, marketing supplies.
[x] - prisma/schema.prisma. in requestItems, add a new field called status(optional) and a field that has only the value of "food" or "materials"(think of a name)
[x] - /inventory/fod-stock/page.tsx. ive added new navList for inventory called food stock. create a form that accepts the following:
food name, quantity, beginning stock, additional stock, issued stock, status
[x] - /inventory/items/page.tsx. add a button inside the `filters` box that shows the popup of the form inside `manage item` page. the form is for adding and issueing item. you can redesign the form
[x] - /inventory/items/page.tsx. slight changes. when selecting the additional and issued stock, put the dropdown selector under the type of vattaxpaper. also implement a cclick outside function
[x] - /inventory/food-stock/page.tsx. do the same with /inventory/items/page.tsx.
[x] - /inventory/items/page.tsx. implement a toggle button that shows food table and materials table alternatively. inside form, add a new input field for category.
[x] - prisma/schema.prisma. remove the category field under requestItems. instead add a new radio button called Food Supplies, and insert it under Account recognition. also remove category in form
[x] - /inventory/items/page.tsx. reorder form. under `type of stocks` is the `account recognition`, then the `type of vat-taxpayer`. make TIN, item code optional in schema.prisma, and make them hidden when `Food Supplies` is selected. add date in between the `month` and `year` input fields. use them values(`month`, `date`, `year`) to override the @default(now()) of the `createdAt` field
[x] - /inventory/items/page.tsx. generally make the TIN no optional up to schema.prisma. also, generally maximize the form to avoid scrollable form, unless its viewing in mobile
[x] - /inventory/items/page.tsx. `additional stock` and `issued stock` issue. `ADDITIONAL STOCK`. move `supplier` and `TIN no` to the second column. `ISSUED STOCK`. rename `supplier` into `Branch`, then move it to the second column
[x] - /inventory/items/page.tsx. create another filter that filters account recognition. also add new metric cards for `food supplies`
[x] - /store/request-items/page.tsx. make it look like POS. cart in right side, add search product, filters account recognition, just to make it look like it maximizes the whole page
[x] - /store/request-items/page.tsx. fix cart where if i add new cart, and add the same cart again, it instantiate new cart instead of updating the quantity of the existing cart
[x] - /store. create a new navlist for Branch Inventory that lists all the inventory of the branch has. they were the issued stocks from the inventory
[x] - /store/sales-report/page.tsx. update the sales report form. add a dropdown for submit daily, weekly, monthly and yearly. reflect it on their dashboard
[x] - /admin/branch/page.tsx. create a group of metric cards for different store base on their daily reports the day before with a percentage feedback comparision to its day before

<!-- [ ] - /admin/branch/page.tsx. aside for daily sales performance, create a section base o -->

[x] - /admin/branch/page.tsx. under `branch mgt`, create a new nav called `Manage Branch`. inside it, just like `branch overview` and `employee profiling`, create a metric cards-like format of list of branches available. similar with `employee profiling`, the card should be redirected to their own page like their profile, showing their daily reports, weekly, monthly, inventories, and request history
[x] - /inventory/page.tsx. fix the issue where the request items are separated despite of having the same product requested
[x] - /inventory/items/page.tsx. same with /inventory/page.tsx requestItems, merge same product requested as well inside `issued stocks` -> `Select Requested Items`
[x] - /store/sales-report/page.tsx. create a toggle dropdown to switch between sales report and inventory report.
[x] - /store/sales-report.tsx. ive created an incomplete form under sales report. it toggles between sales report and inventory report. remaster `inventory report` form. add field where it asks for how many items were used and how many items were left
[x] - fix these issues:

- inventory issued items add new separate inventory instead of deducting it from original source. eg. Ballpen(6), Issued Ballpen(3), result: Ballpen(6)+(3) => Ballpen(9), it should be Ballpen(6), Issued Ballpen(3), result: Ballpen(6)-(3) => Ballpen(3)
- store inventory total price feels weird. fix it

[x] - /inventory/items. fix the issue where after issuing stocks and the stocks drop to 0, its still there. it should be dropped or something, deleted
[x] - /inventory/items/page.tsx. after clicking `Manage Items` and issued stocks, it should reference based on store `requested items` inside the /inventory/page.tsx, and minus it from the total stock of an item
[x] - /inventory/items/page.tsx. issued stock should not create new inventory
[x] - /store/inventory. merge same item, also apply the net pay, not the base calculation
[x] - /store/sales-report/page.tsx. under `Inventory Report`, convert the `Product Name` to a datalist html tag and reference it to the available stocks in their inventory. only leave the `Item Used` and `Item Left` untouched
[x] - /admin/branch/manage/[storeId]/page.tsx. we have an empty store `inventory section`. fetch the available inventory in each store and display it there. add the item status base on their quantity. if the box is to tight, you can redesign or make new layout
[x] - /admin/branch/manage/[storeId]/page.tsx. put inventory related under sales related to maximize the width. store inventory and request history under. add tab above them that shows what is selected
[x] - /admin/branch/manage/[storeId]/page.tsx. only show the latest 4 in daily sales. also, add new tab in inventory group called `inventory report` that references to the /store/sales-report/page.tsx. show daily reports
[x] - /admin/page.tsx. create a branch section and under it a metric card that has the total value of the all the store combined a day before (add a percentage feedback), a line graph that has the data of the total value of all stores within the past 7 days, and another line graph for the past 30 days
[x] - /admin/page.tsx. restyle `overview` section. also, update its `Total Branch`(store accounts) and `Total Personnel`(all accounts)
[x] - restyle all the layoutSidebar. fix the layout, use their initials as their profile, apply name instead of placeholder name, same theme. the header seems doesn't do anything. add it in the sidebar, and maximize the space for the child components
[x] - layoutSidebar. fix the layout of all the logout button. make it belong to the sidebar, just put it under the last navList for just like 8rem, just don't make it look like it was justified between to the rest of the buttons
[x] /admin/branch/manage/[storeId]/page.tsx. im having errors on these lines saying the errors below. fix it
const dailyReports = profile.salesReports.filter(
(r: InventoryItem & { reportType: string }) => r.reportType === "Daily",
);
const weeklyReports = profile.salesReports.filter(
(r: InventoryItem & { reportType: string }) => r.reportType === "Weekly",
);
const monthlyReports = profile.salesReports.filter(
(r: InventoryItem & { reportType: string }) => r.reportType === "Monthly",
);
const yearlyReports = profile.salesReports.filter(
(r: InventoryItem & { reportType: string }) => r.reportType === "Yearly",
);

error:
No overload matches this call.
Overload 1 of 2, '(predicate: (value: { id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }, index: number, array: { ...; }[]) => value is { ...; }, thisArg?: any): { ...; }[]', gave the following error.
Argument of type '(r: InventoryItem & { reportType: string; }) => boolean' is not assignable to parameter of type '(value: { id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }, index: number, array: { id: string; ... 6 more ...; totalSales: number; }[]) => value is { ...; }'.
Types of parameters 'r' and 'value' are incompatible.
Type '{ id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }' is not assignable to type 'InventoryItem & { reportType: string; }'.
Type '{ id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }' is missing the following properties from type 'InventoryItem': productNameGeneral, productNameSpecific, accountRecognition, unitOfMeasurement, and 4 more.
Overload 2 of 2, '(predicate: (value: { id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }, index: number, array: { ...; }[]) => unknown, thisArg?: any): { ...; }[]', gave the following error.
Argument of type '(r: InventoryItem & { reportType: string; }) => boolean' is not assignable to parameter of type '(value: { id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }, index: number, array: { id: string; ... 6 more ...; totalSales: number; }[]) => unknown'.
Types of parameters 'r' and 'value' are incompatible.
Type '{ id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }' is not assignable to type 'InventoryItem & { reportType: string; }'.
Type '{ id: string; createdAt: Date; updatedAt: Date; storeId: string; reportType: string; periodMonth: string; periodYear: string; totalSales: number; }' is missing the following properties from type 'InventoryItem': productNameGeneral, productNameSpecific, accountRecognition, unitOfMeasurement, and 4 more.ts(2769)
[x] - /admin/reports/custom/page.tsx. create a dropdown button to switch between a sales report and inventory report. under, create a simple form that has a `branch picker`, `date picker` and `generate report` button that reference to the reports of a single branch
[x] - /admin/branch/manage/[storeId]/page.tsx. auto calculate the weekly and monthly sales based on the daily sales. weekly sales always starts on Sunday, and monthly sales on the first day of the month
[x] - /admin/reports/custom/page.tsx. sales report will generate the weekly and monthly sales generated by the accumulated daily sales. also, simulate a print function that prints the generated reports
[x] - /admin/reports/custom/page.tsx. fix the issue where selecting a month in form doesnt show the data on that month. it only displays nothing
[x] - /store. use their username as display name instead of the concatenated firstName and lastName. apply to all store related
[x] - /admin/reports/custom/page.tsx, /admin/branch/manage. in branch input field, use the store username as well, same with /branch/manage/page.tsx prioritize the store username instead of their concatenated firstName and lastName
[x] - /admin/reports/custom/page.tsx. create a dropdown with `daily` and `past 7 days`. inventory reports generate inventory reports based on the dropdown state
[x] - /hr/accounts/page.tsx. restyle this page. give life to this page. also create a dynamic route for them. each row should be clickable and will be redirected to their own profile. create a relation with `EmployeeData` use the `EmployeeData` schema for their additional details inside their own profile
[x] - /hr/accounts/page.tsx. add search and filters
[x] - /hr/accounts/page.tsx. filters has total number of accounts beside role. just create a metric card above, and show the total numbers of accounts there
[x] - /hr/accounts/[accountId]/page.tsx. allow profile editing. show N/A for the missing values of email, address, sss, pagibig, etc
[x] - /hr/employees/page.tsx. restyle this page. add life. still make it table list type
[x] - /hr/employees/page.tsx. remove the button to navigate to their own profile. use the whole row instead
[x] - /hr/payrolls/page.tsx. restyle buttons generated by cards. ive created a linkToEmployee() under dal/hr/. the function should create a new data under `data: JSON[]` of `EmployeeWorkData` schema. link the card data to their respective owner based on its employeeId.
[x] - /admin/ under `report` menu. fix the all branch in dropdown, both have 2 choices of `all branch`. fix it. fix the `all branch` inventory report, its not working. create a new submenu of delivery reports that fetches the delivery history for the past 30days
[x] - /admin/reports/delivery/page.tsx. use the `createdAt` field to show the date for the delivery reports. remove `@` in the beginning of the branch name. remove note. also add dropdown to select for the branch to be reported. add print simulation. remove `custom reports` submenu
[x] - /admin/. create a new navList called `Delivery` the uses the exact SPA of /app/delivery/ UI. remove the button section
[x] - /admin/branch management/. instead of `Manage Branch`, use the store accounts as its submenu
[x] - /admin/branch management/. remove all branch.
[x] - /admin/delivery. fix the issue where the map doesnt reflect realtime on delivery personnel
[x] - /inventory/delivery. fix the issue where the map doesnt reflect realtime on delivery personnel?
[x] - /admin/. personnel menu. create a new set of submenu for Personnel MGT: Admin Info, Employee Records, Attendance, Payroll
[x] - /delivery. do not use submenu. `delivery view` is fine
[x] - under `Personnel MGT`, create new menu called `Inventory MGT` with a submenus of `Item List`, `Branch Request`, and `Initial Stock Allocation`
[x] - /admin/personnel/admin-info/page.tsx. just like /hr/accounts/page.tsx, display all accounts in list type, create create account button, search and filters, metric cards with auto filters function
[x] - /admin/personnel/employee-records/page.tsx. just like /hr/employees/page.tsx, list all the employees with a clickable rows, redirecting them to their own profile
[x] - /admin/personnel/employee-records/page.tsx. clicking rows redirect me to startsWith("/hr/"), it should be `/admin/personnel-employee-records/[dynamic]/page.tsx. fix the issue
[x] - /admin/personnel/employee-records/page.tsx. use `/admin/personnel/employee-records/[id]`instead of`/admin/personnel-employee-records/[id]`
[x] - /admin/personnel/attendance/page.tsx. same with`/hr/payrolls/page.tsx`, reuse the same UI and functions
[x] - /admin/inventory/item-list/page.tsx. create a table list of all inventories. create a button above that shows a popup of inventory form. use the form of /inventory/items -> manage item form
[x] - /admin/inventory/item-request/page.tsx. create a tab of every store that displays the list of request that the every branch as made, the history, and every incoming request will reflect in this page. show even the store has no history, etc.
[x] - /admin/Branch MGT. each store has their own page.tsx, at the same time, has a dropdown of sales report, and stocks report. page.tsx has their simple detail like location, who manages, etc.
[x] - /admin/Branch MGT. set instead the map coordinates for location
[x] - /admin/personnel/employee-records/[id]/page.tsx. format the fetched json. only show the `schedules`key. just like the attendance card in`/admin/personnel/attendance/`, have a function that edit and calculates row
[x] - /admin/personnel/employee-records/[id]/page.tsx. total hours section for every card attendance
[x] - /admin/personnel/employee-records/[id]/page.tsx. toggle minutes to hour for total time render
[x] - /admin/personnel/employee-records/[id]/page.tsx. change`total hours`table name heading to`total time (in minutes/hours)`, depends on toggle
[x] - /admin/personnel/employee-records/[id]/page.tsx. clicking at `total time`table heading calculates all calculated values in single card. do not show it in alert function. display result besides total time above
[x] - /admin/personnel/employee-records/[id]/page.tsx. clicking at`total time` table heading calculates all calculated values in single card. do not show it in alert function. show result besides total time above
[x] - /admin/personnel/employee-records/[id]/page.tsx. do these calculations below:
ratePerHour = ratePerDay / hrsPerDay
grossSalary(before deduction) = ratePerHour _ renderedHours
deductions = minsLates _ 1.25
netPay = grossSalary - deductions

- `minsLates` are the `tardiness`, so make a variable for it. display `netPay` above\

[x] - /admin/personnel/employee-records/[id]/page.tsx. always use hour format for total hours, so the toggle for minutes and hours will be removed. reserve the minute format for tardiness. always round down the hours: 09:59 => 09:00, 09:31 => 09:00, 09:01 => 09:00, 08:59 => 08:00.
use these deduction constants:
SSS = 425
PhilHealth = 250
PagIbig = 200
[x] - /admin/personnel/employee-records/[id]/page.tsx. display full rendered time in total time in last table column, for rendering hours accumulation
[x] - /admin/personnel/employee-records/[id]/page.tsx. total time in calculation, the accumulated rendered hours, will be round down here ang only here.
[x] - /admin/personnel/employee-records/[id]/page.tsx. only deduct if the user has SSS, pagibig, or philhealth
[x] - /admin/personnel/employee-records/[id]/page.tsx. allow edit only the profile for employeeData. reflect on db. add delete as well
[x] - /admin/personnel/admin-info/page.tsx. clicking on user throws an error or redirects the admin to `/hr/accounts/[id]/page.tsx.` it should only lingers inside /admin. fix the issue
[x] - /admin/personnel/employee-records/page.tsx. instead of redirecting to another url, show a popup for `add employee` form
[x] - /admin/reports/sales/page.tsx. all branches will have separate print; they should not merge into single group. branch after branch
[x] - /admin/reports/inventory/page.tsx. all branches will have separate prints as well; they should not merge into single group. branch after branch. also add dropdowns: "today", "yesterday", "past 7days"
[x] - /admin/reports/delivery/page.tsx. all branches will have separate prints as well; they should not merge into single group. branch after branch. if you can adapt to the UI of sales and inventory reports, adapt
[x] - /store. also add delivery view to the store sidebar navList. just SPA with no buttons like /admin/delivery-view
[x] - /store/sales-report/page.tsx. only send daily report. weekly and monthly reports will be automatically generated by daily report accumulations
[x] - /store/sales-report/page.tsx. in inventory report, ive noticed that you cant put 0 in auto generated, and it should be disabled and 0 is allowable. also, daily report shall come in batch. its like `adding to cart` before submitting
[x] - create a new model in prisma called ItemsForSale that has name and quantity field, and it should be unique in every store. the data here will be used to the newly created POS, so remove unnecessary input fields
[x] - /store. sidebar. create new navList under Request Items called Issue Food Stocks that has date(for daily), name, quantity, price, to create a new data for `ItemForSale` db
[x] - /store. sidebar. create new navList under Dashboard called POS. use the same UI with the /store/request-items's POS, with only name, quantity, and price input fields. use the `ItemForSale` db for every POS cards
[x] - /store/pos. restyle POS. carts should see the list, not modify something. POS card shows popup for input field quantity. also this seems unrelated, but use the date inside /store/issue-food-stock for ItemForSale createdAt
[x] - /store/pos. checkedout items will make changes to the db. only use the items in POS base on current date Today, even the newly add products
[x] - /store/pos. simulate print receipts on checking out items
[x] - /store/pos. ive created an item for 02/28 (burger, 40), then i create a new item for 03/01 (burger, 50). today is 02/28. this should show only the 40pcs of burger then for tomorrow the 50pcs of burger. what happen is because of duplication, latest burger will be served tomorrow and burger now disappears. fix it
[x] - /store/pos, /store/sales-report. all receipts in data row format will display inside /store/sales-report, and it show the total sales by the POS for today
[x] - /store/pos, /store/sales-report. inventory report. since were creating an item for a day, track quantity of the items sold by the POS. item, initial stock for the day, remaining stocks for the day
[x] - /store/sales-report. add send report button to both Todays POS Transaction and POS Stock Tracker
[x] - /store/sales-report, /admin/branch/manage/[id]/page.tsx. add send report button to both Todays POS Transaction and POS Stock Tracker. the report will reflect on /admin/branch/manage/[id]/page.tsx.
[x] - /admin/branch/manage/[id]/page.tsx. create separate tabs for POS Reports. (POS Transactions, POS Stock Tracker)
[x] - /admin/branch/manage/[id]/page.tsx. POS Transactions and POS Stock Tracker, add generate reports button to simulate print for daily reports
[x] - /admin/branch/manage/[id]/page.tsx. POS Transactions and POS Stock Tracker, add search for dates for filters
[x] - /admin/branch/manage/[id]/page.tsx. add toggle visibility button for store details to maximize report section
[x] - /admin/branch/manage/[id]/page.tsx. clicking date row will redirect me to POS transaction tab that has the sales record of that day
[x] - in all @default(now()) for default createdAt db function, use the function below instead:

const year = new Date().getFullYear();
const month = String(new Date().getMonth() + 1).padStart(2, "0");
const date = String(new Date().getDate()).padStart(2, "0");
const hour = String(new Date().getHours()).padStart(2, "0");
const minute = String(new Date().getMinutes()).padStart(2, "0");
const second = String(new Date().getSeconds()).padStart(2, "0");
const milliseconds = new Date().getMilliseconds();

export const currentNow = `${year}-${month}-${date}T${hour}:${minute}:${second}.${milliseconds}Z`;

update all the @default(now()) to use the above date

[x] - /admin/personnel/employee-records. add branch input field beside employeeId, and put date hired to the last.
[x] - /admin/personnel/employee-records. employee, id, branch, contact, date hired as table header
[x] - /store. sidebar. create new navList called `Employees` that has the data similar to /admin/personnel/employee-records with no fancy styling, unclickable, uneditable, just data rows and readonly
[x] - /store. sidebar. create new navList called `Employees` that has the data similar to /admin/personnel/employee-records with no fancy styling, unclickable, uneditable, just data rows and readonly. filter employees, only displaying the employee like in employee in Calamba branch on JB Calamba, employee in Pila in JB PILA
[x] - /store. sidebar. create new navList called `Attendancce`. it has the /admin/personnel/attendance form only that the table is uneditable
[x] - /store/attendance. get the input excel form in /hr/payrolls, but it should be uneditable. a button that store the data to an object, and a button to batch link the cards to the employee with the same id
[x] - /store/attendance. toggle visibility for linked attendance records
[x] - /admin. dashboard. create a section for all store notifications. each store has notification for item request, notification for `link to employees` of /store/attendance (just ping that new attendance has arrived)
[x] - /admin. dashboard. fix the issue where it still send notifications, even the linked employeeId is nonexistent
[x] - /admin. dashboard. fix the issue where it send 2 notifications, even only 1 employeeId is existing
[x] - /admin. dashboard. merge store notification and live item request. use tabs and use notification dots for every store that has a notification
[x] - /admin. dashboard. add reject button for every item, and a popup for notes on item requests
[x] - /admin. dashboard. allow delete for every notifications to avoid overloads
[x] - /admin/inventory/item-request. add button to add for batch issue stocks for every requested items
[x] - /admin/personnel/employee-records. add filters for name and branch
[x] - /admin/inventory/item-request. batch issue button shows popup that takes custom notes
[x] - /admin/branch/manage/[id]. in stock report section. make tabs name(Dry Items, Raw Materials, Request history). dry items are the operational supplies, office supplies, janitorials, marketing supplies. Raw materials has the food supplies. no changes for history
[x] - /admin/inventory/initial-stock-allocation. create a form that directs it to the inventory of the store. same with the form in /admin/inventory/item-list, default it to issued stock, has no parameters to issue a stock, no dropdown, can fill up the form freely. remove the month and year aobe and use the currentNow()
[x] - /admin/inventory/initial-stock-allocation. remove unit price, type of taxpayer, supplies name(it has already store above), product name specific, unit price, calculations
[x] - /admin/inventory/initial-stock-allocation. success form will automatically import to the store as their inventory
[x] - /store/inventory. /admin/inventory/initial-stock-allocation. successful doesnt reflect on store invnentory, fix it
[x] - /store/issue-food-stocks. current food stocks section shows an item from iventory with food supplies only
[x] - /store/request-items. /store/issue-food-stocks should not create new item in inventory. it just create an initial item for store freely
[x] - /store/issue-food-stocks. i know you are issuing stocks, but dont create new items in /admin/inventory/item-list as issued stocks type.
[x] - /store/pos. do reference below: 1 Burger = 1 patty & 2 buns, reduce the; 1 spaghetti = 200 grams of spag noodles & 60 grams of spag sauce; 1 burger steak = 1 patty & 200 grams of rice & 60 grams of steak sauce; 1 chicken = 1 raw chicken
[x] - /delivery. deeply review this SPA. fix the issue where it does not work properly. STARTING GPS button does not reflect on map realtime
[x] - fix the issue where localStorage, after logging in, adapts to the latest logged user. each user should use their own localStorage. if i log in as admin in new tab, browser dev tools localStorage shows admin. then if i log in as delivery in new tab, browser dev tools localStorage shows delivery, but the ADMIN for the other tabs still showing.
[x] - /admin/inventory/item-list, schema.prisma. remove fields: month, year, date, typeOfVatTaxpayer, update accountRecognition, reduce account recognition to 2(dry materials and raw materials), remove type of taxpayer, only display total price
[x] - /admin/inventory/item-list. remove date-related input fields, reduce account recognition to 2(dry materials and raw materials), remove type of taxpayer, only display total price
[x] - /admin/inventory/item-list. add date table field using createdAt
[x] - /admin/inventory/item-list. update `updatedAt` field to using the currentNow() method as well
[x] - /admin/inventory/item-list. update `createdAt` field to using the currentNow() method as well
[x] - /admin/inventory/item-list. today is `Feb 28, 2026`. i did add a product using `beginning stocks`, and it displays `Feb 28, 2026` as table data under `Date` table header. then i did update the same product using `additional stocks` and it now displays `March 1, 2026`. it should be `Feb 28, 2026` since tomorrow is `March 1, 2026`. fix this issue
[x] - /admin/inventory/item-list. Date column: use createdAt only (not updatedAt) so the date stays correct after adding additional stocks
[x] - /admin/inventory/item-list. fix the issue where i need to refresh the page whenever i added new product or modify a product
[x] - /admin/inventory/initial-stock-allocation. update account recognition. and, i know its in issued stock by default. but can you not instantiate an inventory while allocating initial stock?? do not make a new inventory but at the same time create inventory for the selected store.
[x] - /admin/delivery, /inventory/delivery. copy the /inventory/delivery to /admin/delivery while maintaining the same functionality: sending items for delivery, monitoring delivery tracking using realtime map, and the data like store name, destinations, etc.
[x] - /admin/delivery. map does not reflect real time. fix it
[x] - /store/issue-food-stocks. Current Food Stocks. fetch all the inventory with `Raw materials` account recognition, and display here
[x] - /store/issue-food-stocks. remove date to the form and to the compound key in the database.
[x] - /store/issue-food-stocks. error on adding a food stock. fix it
[x] - /store/sales-report. add currentNow() date in sales report and display it on table as well. add date filter for the table, or separate pos receipts by date
[x] - /admin/branch/manage/[id]. in stocks report, fetch inventory from store to be shown in dry items and raw materials inside report -> stocks report
[x] - /admin/personnel/employee-records/[id]. generate payslip for every employee month by printing netPay simulation. make it look like payslip.
[x] - /admin/personnel/employee-records/[id]. print button is not for general, but every month has print button
[x] - /store/page.tsx. get the UI from /store/history. display only the last 10 history
[x] - /store/page.tsx. display only the last 10 history. add new table header for date
[x] - /admin/inventory/item-request. add new table header for date as well
