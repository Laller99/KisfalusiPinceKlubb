import { BrowserRouter } from "react-router-dom"; // ⚠️ JAVÍTÁS: Importáljuk a Router-t
// Az 'useState' már nem szükséges, ha nincs használva
import VineyardWebsite from "./components/VineyardWebsite";
import "./App.css";

function App() {
  // A felesleges 'useState' és 'count' eltávolítva

  return (
    // ⚠️ JAVÍTÁS: <BrowserRouter> beágyazás a teljes alkalmazás köré
    <BrowserRouter>
      <div className="App">
        <VineyardWebsite />
      </div>
    </BrowserRouter>
  );
}

export default App;
