export function isAnswerCorrect(
  userAnswer: string | string[] | undefined,
  correctAnswer: string | string[]
): boolean {
  if (!userAnswer) return false
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false
    const correct = [...correctAnswer].sort()
    const user = [...userAnswer].sort()
    return correct.length === user.length && correct.every((c, i) => c === user[i])
  }
  return userAnswer === correctAnswer
}
