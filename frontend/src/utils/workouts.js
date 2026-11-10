export function groupLogActivities(log) {
  const raw = log.activities || []
  const groups = raw.reduce((acc, cur) => {
    const id = cur.activity?.id
    if (!id) return acc
    const isLifting = cur.activity?.type === 'Lifting'
    acc[id] ||= { activityId: id, type: isLifting ? 'Lifting' : 'Cardio', unit: isLifting ? 'reps' : (cur.unit || ''), setsData: [] }
    if (isLifting) acc[id].setsData.push({ weight: cur.amount || '', reps: cur.reps || '' })
    else acc[id].setsData.push({ amount: cur.amount || '' })
    return acc
  }, {})
  return { logId: log.id, baseWorkout: log.base_workout, date: log.date, groupedActivities: Object.values(groups) }
}

export function flattenLogActivities(groupedActivities) {
  const out = []
  groupedActivities.forEach(group => {
    if (group.type === 'Lifting') {
      group.setsData?.forEach(set => out.push({ activity_id: group.activityId, unit: 'reps', amount: set.weight, reps: set.reps }))
    } else {
      group.setsData?.forEach(row => out.push({ activity_id: group.activityId, unit: group.unit, amount: row.amount }))
    }
  })
  return out
}