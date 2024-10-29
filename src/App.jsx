import { useState } from "react";
import "./App.css";
import Map from "./components/map";
function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<Map />
		</>
	);
}

export default App;
