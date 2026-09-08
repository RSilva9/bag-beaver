import { Link } from "react-router-dom";

export default function MainMenu(){
    return(
        <div>
            <h1 className="text-[50px]">MAIN MENU</h1>
            <div className="flex justify-evenly m-auto w-full">
                <Link to={"/join-campaign"} className="text-[30px] p-5 border-solid border-2 min-w-100 cursor-pointer text-center">I'M A PLAYER</Link>
                <Link to={"/campaign-dashboard"} className="text-[30px] p-5 border-solid border-2 min-w-100 cursor-pointer text-center">I'M A GAME MASTER</Link>
            </div>
        </div>
    )
}