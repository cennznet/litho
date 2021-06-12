import Head from 'next/head'

export default function Home() {
  return (
    <div className='w-screen h-screen px-2 flex flex-col justify-center items-center'>
      <Head>
        <title>NextJS Project Starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='py-20 flex-1 flex flex-col justify-around items-center'>
        <h1 className='leading-5 text-6xl text-center'>
          <a className='text-primary no-underline hover:underline active:underline focus:underline' href="https://nextjs.org">Next.js!</a> Project Starter
        </h1>
        <ul className='w-full'>
        <h3 className='text-4xl'>Features:</h3>
          <li>TypeScript</li>
          <li>SASS</li>
          <li>TailwindCSS</li>
        </ul>
      </main>


      <footer className='w-full h-12 flex justify-center items-center border-t border-gray-300 fixed bottom-0'>
        Made by&nbsp;<a className='flex justify-center items-center text-primary font-bold hover:underline active:underline focus:underline' href="https://github.com/shad-k">Shadab Khan</a>
      </footer>
    </div>
  )
}
