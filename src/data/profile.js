import mePhoto from '../../assets/me.png'

export const profile = {
  name: 'Nestor Desabille',
  firstName: 'Nestor',
  initials: 'ND',
  email: 'nestordesabille4@gmail.com',
  // Avatar image. Set to null to show the initials instead.
  photo: mePhoto,
  // me.png is a full-body shot, so the avatar zooms in on the face.
  // translate moves the face (about 45% across, 34% down) to the center of the circle.
  photoStyle: { transform: 'scale(2.4) translate(5%, 16%)' },
  // Dashboard greeting. Taken from the resume.
  title: 'Full Stack Engineer',
  location: 'Cebu, Philippines',
  experience: '4+ years',
  summary: 'I build SaaS products from the ground up with Vue.js and ASP.NET Core, from the first commit to production.',
  education: [
    { degree: 'BS Computer Engineering', school: 'University of San Carlos', year: 2023 },
  ],
  // Skill groups on the profile page. Any project stack item not listed here shows under "Other".
  skillCategories: [
    { name: 'Frontend', skills: ['Vue.js', 'React.js', 'Next.js', 'TypeScript', 'Vuetify', 'PrimeVue', 'MUI'] },
    { name: 'Backend', skills: ['ASP.NET Core', '.NET', 'Express', 'GraphQL', 'SignalR', 'Google Ads API'] },
    { name: 'Database', skills: ['SQL Server', 'PostgreSQL', 'Supabase', 'Drizzle'] },
    { name: 'Cloud & Services', skills: ['AWS', 'Azure Functions', 'Vercel', 'Auth0'] },
  ],
  // Fun facts on the profile page. label: short mono tag above the name. icon: gamepad | paddle | waves.
  hobbies: [
    { name: 'Dota 2', icon: 'gamepad', label: 'Gaming', note: 'Five-player strategy, tight coordination and a lot of patch notes.' },
    { name: 'Pickleball', icon: 'paddle', label: 'Sport', note: 'Fast rallies at the kitchen line. Easy to start, hard to put down.' },
    { name: 'Free Diving', icon: 'waves', label: 'Ocean', note: 'One breath, no tanks. Cebu has some of the best water for it.' },
  ],
}
