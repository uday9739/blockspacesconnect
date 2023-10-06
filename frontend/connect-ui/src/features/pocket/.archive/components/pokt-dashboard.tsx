// import React from "react";
// import { observer } from "mobx-react-lite";

// import PoktDashboard, { Body, Header, Title, ChartWrap, Data, PoktTotals } from "./pokt-dashboard.styles";

// import { Chart, ChartTypes, Loading, Total } from "@platform/common";
// import { usePoktData } from "@pocket/queries";
// import { usePocketUIStore } from "@pocket/providers";


// const optionsPoktChart = () => {
//   const options: ChartOptions = {};
//   options.scales = {
//     x: {
//       stacked: true,
//       grid: { borderColor: "#f1f1f4" },
//       ticks: { font: { size: 11 } }
//     },
//     y: {
//       stacked: true,
//       min: 0,
//       grid: { borderColor: "#f1f1f4" },
//       ticks: {
//         font: { size: 11 },
//         callback: (value, index, ticks) => {
//           return typeof value === "number" ? numeral(value).format(getNumberFormat(value)[0]).toUpperCase() : value;
//         }
//       }
//     }
//   };
//   options.borderColor = "#f1f1f4";
//   options.aspectRatio = 2.5;
//   options.plugins = {
//     legend: { display: false } //TODO @Justin I added this so that we can select between category
//   };
//   options.scales.y.min = Math.floor(limitsPoktChart.yMin * 0.99);
//   return options;
// }
// const usePageData = () => {
//   const { optionsPoktChart } = usePocketUIStore();
//   const { poktData, poktDataLoading, poktDatasets, labelsPoktChart } = usePoktData();

//   return {
//     optionsPoktChart,
//     poktData,
//     poktDataLoading,
//     poktDatasets,
//     labelsPoktChart
//   }
// }

// const POCKET_DASHBOARD = observer(() => {
//   const { optionsPoktChart, poktData, poktDataLoading, poktDatasets, labelsPoktChart } = usePageData()  

//   return (
//     <PoktDashboard>
//       <Body>
//         <Header>
//           <Title>POKT</Title>
//         </Header>
//         <Data>
//           <ChartWrap>
//             <Loading when={poktDataLoading}>
//               <Chart type={ChartTypes.LINE} data={{ labels: labelsPoktChart, datasets: poktDatasets }} options={optionsPoktChart} />
//             </Loading>
//           </ChartWrap>
//           <PoktTotals>
//             <Loading when={poktDataLoading}>
//               {poktData.totals.map((total, index) => (
//                 <Total key={index} {...total} variation="centered" />
//               ))}
//             </Loading>
//           </PoktTotals>
//         </Data>
//       </Body>
//     </PoktDashboard>
//   );
// });

// export default POCKET_DASHBOARD;
