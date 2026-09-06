import './Footer.css'

function Footer() {
  function handleContact() {
    window.location.href =
      'mailto:khadseshantanu02@gmail.com?subject=Add my business to QueueLess'
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* ABOUT QUEUELESS */}

        <div className="footer-about">
          <span className="footer-label">
            ABOUT QUEUELESS
          </span>

          <h2>
            Smarter Queues.
            <br />
            <span>Better Experience.</span>
          </h2>

          <p>
            QueueLess helps people save time by allowing
            them to join queues remotely, track their
            position in real time, and know when it's
            their turn.
          </p>

          <div className="footer-benefits">
            <div className="footer-benefit">
              <span>✓</span>
              <div>
                <strong>Join Remotely</strong>
                <small>
                  Join a queue from anywhere.
                </small>
              </div>
            </div>

            <div className="footer-benefit">
              <span>✓</span>
              <div>
                <strong>Real-time Updates</strong>
                <small>
                  Track your position and stay informed.
                </small>
              </div>
            </div>

            <div className="footer-benefit">
              <span>✓</span>
              <div>
                <strong>Save Time</strong>
                <small>
                  Spend less time waiting in line.
                </small>
              </div>
            </div>

            <div className="footer-benefit">
              <span>✓</span>
              <div>
                <strong>Reliable & Secure</strong>
                <small>
                  Your experience stays protected.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* BUSINESSES */}

        <div className="footer-business">
          <span className="footer-label">
            FOR BUSINESSES
          </span>

          <h2>
            Grow your business
            <br />
            with <span>QueueLess</span>
          </h2>

          <p>
            Bring your service center to QueueLess and
            offer your customers a modern, convenient
            way to manage queues.
          </p>

          <div className="footer-business-box">
           <span className="footer-business-icon">
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 10V20H20V10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M3 10L5 4H19L21 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M3 10C3 11.1 3.9 12 5 12C6.1 12 7 11.1 7 10C7 11.1 7.9 12 9 12C10.1 12 11 11.1 11 10C11 11.1 11.9 12 13 12C14.1 12 15 11.1 15 10C15 11.1 15.9 12 17 12C18.1 12 19 11.1 19 10C19 11.1 19.9 12 21 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M9 20V15H15V20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</span>

            <div>
              <strong>
                Want to get started?
              </strong>

              <small>
                Contact our team to add your business
                to QueueLess.
              </small>
            </div>
          </div>

          <button
            className="footer-contact-button"
            onClick={handleContact}
          >
            Contact Business Team →
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 QueueLess</span>
        <span>Built to save time.</span>
      </div>
    </footer>
  )
}

export default Footer