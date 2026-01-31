async function generateCaptions(clipText) {
    return {
      TikTok: `${clipText} 🤯 #lifechanging`,
      Twitter: `${clipText} Changed everything for me.`,
      LinkedIn: `Takeaway: ${clipText} – adapt or fall behind.`
    };
  }
  
  module.exports = { generateCaptions };