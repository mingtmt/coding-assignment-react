import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { TicketsList } from "../pages/TicketsList";
import { TicketDetail } from "../pages/TicketDetail";

const App = () => {
  return (
    <Routes>
      <Route index element={<TicketsList />} />
      <Route path="ticket/:id" element={<TicketDetail />} />
      <Route path="*" element={<p>Not found</p>} />
    </Routes>
  );
};

export default App;
