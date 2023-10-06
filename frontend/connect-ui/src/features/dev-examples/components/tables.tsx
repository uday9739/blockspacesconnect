export {}
// import { Box, Typography, useTheme } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";

// const InvoicesGrid = () => {
//   const theme = useTheme();

//   const columns = [
//     { field: "id", headerName: "ID" },
//     {
//       field: "name",
//       headerName: "Name",
//       flex: 1,
//       cellClassName: "name-column--cell"
//     },
//     {
//       field: "phone",
//       headerName: "Phone Number",
//       flex: 1
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1
//     },
//     {
//       field: "cost",
//       headerName: "Cost",
//       flex: 1,
//       renderCell: (params) => <Typography>${params.row.cost}</Typography>
//     },
//     {
//       field: "date",
//       headerName: "Date",
//       flex: 1
//     }
//   ];

//   return (
//     <Box m="20px">
//       <Box m="40px 0 0 0" height="75vh">
//         <DataGrid checkboxSelection rows={mockDataInvoices} columns={columns} />
//       </Box>
//     </Box>
//   );
// };

// export default InvoicesGrid;

// const mockDataInvoices = [
//   {
//     id: 1,
//     name: "Jon Snow",
//     email: "jonsnow@gmail.com",
//     cost: "21.24",
//     phone: "(665)121-5454",
//     date: "03/12/2022"
//   },
//   {
//     id: 2,
//     name: "Cersei Lannister",
//     email: "cerseilannister@gmail.com",
//     cost: "1.24",
//     phone: "(421)314-2288",
//     date: "06/15/2021"
//   },
//   {
//     id: 3,
//     name: "Jaime Lannister",
//     email: "jaimelannister@gmail.com",
//     cost: "11.24",
//     phone: "(422)982-6739",
//     date: "05/02/2022"
//   },
//   {
//     id: 4,
//     name: "Anya Stark",
//     email: "anyastark@gmail.com",
//     cost: "80.55",
//     phone: "(921)425-6742",
//     date: "03/21/2022"
//   },
//   {
//     id: 5,
//     name: "Daenerys Targaryen",
//     email: "daenerystargaryen@gmail.com",
//     cost: "1.24",
//     phone: "(421)445-1189",
//     date: "01/12/2021"
//   },
//   {
//     id: 6,
//     name: "Ever Melisandre",
//     email: "evermelisandre@gmail.com",
//     cost: "63.12",
//     phone: "(232)545-6483",
//     date: "11/02/2022"
//   },
//   {
//     id: 7,
//     name: "Ferrara Clifford",
//     email: "ferraraclifford@gmail.com",
//     cost: "52.42",
//     phone: "(543)124-0123",
//     date: "02/11/2022"
//   },
//   {
//     id: 8,
//     name: "Rossini Frances",
//     email: "rossinifrances@gmail.com",
//     cost: "21.24",
//     phone: "(222)444-5555",
//     date: "05/02/2021"
//   }
// ];
