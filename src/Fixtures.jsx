function Fixtures() {
  const fixtures = [
    {
      date: 'May 10, 2026',
      teams: 'Team Alpha vs Team Beta',
      venue: 'Hcpl Stadium',
      status: 'Scheduled',
    },
    {
      date: 'May 12, 2026',
      teams: 'Team Gamma vs Team Delta',
      venue: 'City Arena',
      status: 'Scheduled',
    },
    {
      date: 'May 14, 2026',
      teams: 'Team Alpha vs Team Gamma',
      venue: 'National Ground',
      status: 'Scheduled',
    },
  ]

  const announcements = [
    'New match tickets are now available for the HCPL Hazaribag weekend fixtures.',
    'Omega Cup Hazaribag partner updates will be announced for the Hazaribagh Premier League.',
    'Live Match Hazaribag score updates will be available for every Cricket League in Jharkhand match day here.',
  ]

  return (
    <main className="fixtures-page">
      <section className="fixtures-overview">
        <h2>Hazaribagh Cricket Tournament Fixtures</h2>
        <p>All upcoming HCPL Hazaribag matches, Live Match Hazaribag updates, and latest Omega Cup Hazaribag announcements are listed below.</p>
      </section>

      <section className="fixture-list">
        {fixtures.map((fixture, index) => (
          <div key={index} className="fixture-card">
            <div className="fixture-date">{fixture.date}</div>
            <div className="fixture-teams">{fixture.teams}</div>
            <div className="fixture-venue">Venue: {fixture.venue}</div>
            <div className="fixture-status">Status: {fixture.status}</div>
          </div>
        ))}
      </section>

      <section className="announcements">
        <h2>Hazaribagh Premier League News and Announcements</h2>
        <ul>
          {announcements.map((announcement, index) => (
            <li key={index}>{announcement}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default Fixtures
