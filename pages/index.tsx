import type { NextPage } from 'next'
import dynamic from 'next/dynamic'

const ImageCreator = dynamic(() => import('../components/ImageCreator'), { ssr: false })

const Home: NextPage = () => {
  return <ImageCreator />
}

export default Home
