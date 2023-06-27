import React from 'react'
import {createBrowserRouter} from "react-router-dom";
import Summary from "./summary/Summary";
import GenerateUT from "./generateUT/GenerateUT";

export const route = createBrowserRouter([
    {path: "/summary", element: <Summary/>},
    {path: "/generateUT", element: <GenerateUT/>}
]);
