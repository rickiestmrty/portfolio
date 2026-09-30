// Demo race for the EVStream odds screen. All names are made up.
export const race = {
  name: 'Gallop R1',
  win: '$2K',
  place: '$800',
  jumpsInSeconds: 11 * 60,
}

// Silk colors are CSS variable names from style.css.
export const runners = [
  { id: 1, number: 1, name: 'Copper Tempest', jockey: 'A. Reyes', barrier: 4, open: 2.6, silk: ['--status-pending', '--surface'] },
  { id: 2, number: 2, name: 'Midnight Ledger', jockey: 'K. Moreau', barrier: 7, open: 6.5, silk: ['--text', '--status-checked-in'] },
  { id: 3, number: 3, name: 'Saltwater Sonnet', jockey: 'J. Okafor', barrier: 2, open: 6.5, silk: ['--accent', '--surface'] },
  { id: 4, number: 4, name: 'Harbour Ghost', jockey: 'L. Tanaka', barrier: 9, open: 7.5, silk: ['--surface', '--text'] },
  { id: 5, number: 5, name: 'Lucky Pistachio', jockey: 'M. Bianchi', barrier: 1, open: 16, silk: ['--status-confirmed', '--status-pending'] },
  { id: 6, number: 6, name: 'Velvet Thunder', jockey: 'S. Walsh', barrier: 5, open: 12, silk: ['--status-checked-in', '--surface'] },
  { id: 7, number: 7, name: 'Paper Kingdom', jockey: 'D. Nguyen', barrier: 10, open: 40, silk: ['--danger', '--surface'] },
  { id: 8, number: 8, name: 'Northbound Nellie', jockey: 'R. Castillo', barrier: 3, open: 48, silk: ['--text-muted', '--status-pending'] },
  { id: 9, number: 9, name: 'Quiet Riot', jockey: 'P. Hughes', barrier: 8, open: 34, silk: ['--accent', '--danger'] },
  { id: 10, number: 10, name: 'Ember Lane', jockey: 'T. Silva', barrier: 6, open: 26, silk: ['--status-pending', '--text'] },
]

export const bookies = [
  { id: 'punchline', name: 'Punchline', initials: 'P', color: '--accent' },
  { id: 'oddsly', name: 'Oddsly', initials: 'O', color: '--status-checked-in' },
  { id: 'furlong', name: 'Furlong', initials: 'F', color: '--status-pending' },
  { id: 'longshot', name: 'Longshot', initials: 'L', color: '--danger' },
]
