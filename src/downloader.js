import clk from 'chalk'
import moment from 'moment'
import constants from './constants/shared'
import download from './lib/download'
import convertFileToOgg from './lib/convertFileToOgg'
import deleteFile from './lib/deleteFile'
import uploadFileToS3 from './lib/uploadFileToS3'

export default () => {
  moment.locale('it')
  const day = moment().subtract(5, 'day')
  const filename = `${moment(day).format('ddd_DDMMYYYY')}_ZOO${constants.EXTENSION}`

  download(filename)
    .then(convertFileToOgg)
    .then(([inputFile, outputFile]) =>
      deleteFile(inputFile)
        .then(() => outputFile)
    )
    .then((fullPath) => uploadFileToS3(
      fullPath,
      constants.BUCKET_NAME,
      filename
    ))
    .then(([filePath, bucketName, key]) => {
      console.log(
        clk.grey(`File ${clk.magenta(filePath)} uploaded to ${clk.magenta(`s3://${bucketName}/${key}`)}`)
      )
      return deleteFile(filePath)
    })
    .then((filePath) => {
      console.log(
        clk.grey(`File ${clk.magenta(filePath)} deleted`)
      )
    })
    .catch((err) => console.error(err))
}
