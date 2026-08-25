import instagramWordmark from "../assets/instagram-wordmark-2026.svg";

const INSTAGRAM_URL = "https://www.instagram.com/JuzeppeJostko/";

export default function ContactsScreen() {
  return (
    <div className="screen__inner contacts">
      <a
        className="contacts__ig"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram — @juzeppejostko"
      >
        <img
          className="contacts__ig-logo"
          src={instagramWordmark}
          alt="Instagram"
        />
        <span className="contacts__ig-handle">@juzeppejostko</span>
      </a>
    </div>
  );
}
