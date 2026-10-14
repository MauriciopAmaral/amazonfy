import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import AppLayout from "./components/AppLayout";
import { GuestOnly, RequireAdmin, RequireAuth } from "./components/RouteGuards";
import Home from "./pages/Home";
import Listing from "./pages/Listing";
import Artist from "./pages/Artist";
import Song from "./pages/Song";
import Video from "./pages/Video";
import Podcast from "./pages/Podcast";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Header />

      <main className="page">
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/artists" element={<Listing type="artists" />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/songs" element={<Listing type="songs" />} />
              <Route path="/song/:id" element={<Song />} />
              <Route path="/videos" element={<Listing type="videos" />} />
              <Route path="/video/:id" element={<Video />} />
              <Route path="/podcasts" element={<Listing type="podcasts" />} />
              <Route path="/podcast/:id" element={<Podcast />} />
              <Route path="/search" element={<Search />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
