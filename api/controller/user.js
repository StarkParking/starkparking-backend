import { UserModel } from '../../helpers/database.js'
import logger from '../../helpers/logger.js'

export const saveUser = async (req, res) => {
  const { userId, username } = req.body

  if ((!userId, !username)) {
    logger
      .debug('Missing required fields')
      .json({ result: false, message: 'Missing required fields' })
  }

  try {
    const user = await UserModel.findOne({ userId })

    if (user) {
      logger.debug('User already exists')
      await db.User.updateOne({ userId }, { $set: { refreshToken } })

      return res
        .status(200)
        .json({ result: true, accessToken, message: 'User already exists' })
    }

    const newUser = db.User({
      userId,
      username
    })

    await newUser.save()

    res
      .status(200)
      .json({ result: true, accessToken, message: 'User saved successfully' })
    logger.info(`User ${username} saved successfully`)
  } catch (error) {
    logger.error('Error saving user', error)
    res.status(500).json({ result: false, message: 'Error saving user' })
  }
}
