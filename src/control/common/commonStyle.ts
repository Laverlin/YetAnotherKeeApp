export const scrollBar = {
  "overflow-y": 'overlay',
  "&::-webkit-scrollbar" : {
    width: '10px',
  },
  "&::-webkit-scrollbar-track": {
    background: 'transparent',
  },
  "&::-webkit-scrollbar-button": {
    height: '4px'
  },
  "&::-webkit-scrollbar-thumb": {
    background: 'transparent',
    borderRadius: '10px',
    backgroundClip: 'padding-box',
    borderRight: '2px transparent solid',
    borderLeft: '2px transparent solid'
  },
  "&:hover": {
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: 'rgba(180, 180, 180, 0.6)'
    }
  }
}
