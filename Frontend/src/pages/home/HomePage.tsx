import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    return <button className="bg-amber-800 text-white cursor-pointer"
    onClick={() => navigate("/worlds")}>
        Worlds
    </button>
};

export default HomePage;
