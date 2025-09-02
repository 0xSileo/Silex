import { getBlockNumber, getBlockByNumber } from "/src/lib/utils/utils";

const NUMBER_OF_HISTORICAL_BLOCKS = 30;

export async function load({ params }) {

  const currentBlockNumber = await getBlockNumber();
  const blockNumbers = Array.from({ length: NUMBER_OF_HISTORICAL_BLOCKS }, (_, i) => currentBlockNumber - i);
  const blockList = await Promise.all(blockNumbers.map(num => getBlockByNumber(num)));

  return {
    blockList,
    NUMBER_OF_HISTORICAL_BLOCKS
  }

}