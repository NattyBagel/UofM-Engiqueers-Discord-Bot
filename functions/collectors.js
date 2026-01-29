

/**
 * Collects a Modal Submission
 * @param interaction the interaction where the modal was shown
 * @param timeout the amount of seconds until the collector is broken
 * @return modalInteraction Promise (modalInteraction or Null)
 */
function modalCollector(interaction,timeout){
    const collectorFilter = i => {
        i.deferUpdate()
        return i.user.id === interaction.user.id && i.isModalSubmit()
    }
    return interaction.awaitModalSubmit({ filter: collectorFilter, time: timeout * 1000 })
    .catch(() => {return null})
}

module.exports = {
    modalCollector
}