import { Link } from "react-router-dom";
import BookingForm from "../components/BookingForm";

function PublicBookingPage() {
    return (
        <main className="app">
            <div className="public-page">
                <header className="public-header">
                    <strong>EasyTable</strong>

                    <Link
                        className="manager-login-link"
                        to="/manager/login"
                    >
                        Manager Login
                    </Link>
                </header>

                <BookingForm />
            </div>
        </main>
    );
}

export default PublicBookingPage;