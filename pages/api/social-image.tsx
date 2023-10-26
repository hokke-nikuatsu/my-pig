import { NextApiResponse } from 'next'
import { NextRequest } from 'next/server'

import { api, apiHost, host, rootNotionPageId } from '@/lib/config'
import { NotionPageInfo } from '@/lib/types'

export default async function OGImage(req: NextRequest, res: NextApiResponse) {
  const { searchParams } = new URL(req.url, host)
  const pageId = searchParams.get('id') || rootNotionPageId
  if (!pageId) {
    return new Response('Invalid notion page id', { status: 400 })
  }

  try {
    const pageInfoRes = await fetch(`${apiHost}${api.getNotionPageInfo}`, {
      method: 'POST',
      body: JSON.stringify({ pageId }),
      headers: {
        'content-type': 'application/json'
      }
    })
    if (!pageInfoRes.ok) {
      return new Response(pageInfoRes.statusText, {
        status: pageInfoRes.status
      })
    }
    const pageInfo: NotionPageInfo = await pageInfoRes.json()
    const ogImageUrl = pageInfo.image

    const imageRes = await fetch(ogImageUrl)
    if (!imageRes.ok) {
      return new Response(imageRes.statusText, { status: imageRes.status })
    }

    const buffer = await imageRes.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)
    const contentType = imageRes.headers.get('Content-Type')

    res.setHeader('Content-Type', contentType)
    res.send(imageBuffer)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error: ' + error.message)
  }
}
