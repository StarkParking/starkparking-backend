import { UserModel } from '../../models/db.js'
import logger from '../../helpers/logger.js'

export const saveUser = async (req, res) => {
  const { userId, username, walletAddress } = req.body

  if ((!userId, !username, !walletAddress)) {
    logger
      .debug('Missing required fields')
      .json({ result: false, message: 'Missing required fields' })
  }

  try {
    const user = await UserModel.findOne({ userId })

    if (user) {
      logger.debug('User already exists')
      return res
        .status(200)
        .json({ result: true, message: 'User already exists' })
    }

    const newUser = UserModel({
      userId,
      username
    })

    await newUser.save()

    res
      .status(200)
      .json({ result: true, message: 'User saved successfully' })
    logger.info(`User ${username} saved successfully`)
  } catch (error) {
    logger.error('Error saving user', error)
    res.status(500).json({ result: false, message: 'Error saving user' })
  }
}
