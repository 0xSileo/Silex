import { getBlockNumber } from "/src/lib/utils/utils";

export async function load() {

  const currentBlockNumber = await getBlockNumber()

    // Return the data to be used in the component
    return {
      currentBlockNumber
    };
}