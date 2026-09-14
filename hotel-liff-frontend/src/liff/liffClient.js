import liff from '@line/liff'
import { env } from '../config/env.js'

let initPromise = null

export function initLiff() {
  if (!initPromise) {
    initPromise = liff.init({ liffId: env.liffId })
  }
  return initPromise
}

export { liff }
