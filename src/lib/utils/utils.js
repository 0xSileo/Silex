import secp256k1 from 'secp256k1';
import Keccak from 'keccak';
import rlp from 'rlp';

export const BLOCK_TIME = 12; // seconds

/** Utility: Check if string is an unsigned decimal integer */
export function isDecimalUint(str) {
  return /^\d+$/.test(str);
}

/** Utility: Check if string is a valid 32-byte hex (with or without 0x prefix) */
export function isBytes32Hex(str) {
  return /^(0x)?[0-9a-fA-F]{64}$/.test(str);
}

/** Utility: Convert camelCase to human-readable string */
export function camelToHuman(camelStr) {
  if (!camelStr) return '';
  const words = camelStr.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function getBlockByNumber(blockNumber) {
  return await sendRequest('eth_getBlockByNumber', [blockNumber, false]);
}

export async function getBlockByHash(blockHash) {
  return await sendRequest('eth_getBlockByHash', [blockHash, false]);
}

export async function getTransactionCount(ethAddress) {
  const result = await sendRequest('eth_getTransactionCount', [ethAddress, 'latest']);
  return parseInt(result);
}

export async function getTransactionByHash(txHash) {
  return await sendRequest('eth_getTransactionByHash', [txHash]);
}

export async function getBalance(ethAddress) {
  const result = await sendRequest('eth_getBalance', [ethAddress, 'latest']);
  return parseInt(result) / 10 ** 18;
}

export async function getBlockNumber() {
  const result = await sendRequest('eth_blockNumber', []);
  return parseInt(result);
}

export async function getBlockReceipts(blockNumber) {
  const result = await sendRequest('eth_getBlockReceipts', [blockNumber]);
  return result;
}

export async function getCode(ethAddress) {
  return await sendRequest('eth_getCode', [ethAddress, 'latest']);
}

export async function refreshBlockData(newBlockNumber) {
  const block = await getBlockByNumber(newBlockNumber);
  const blockReceipts = await getBlockReceipts(newBlockNumber);

  let baseFeeCheck = null;
  if (newBlockNumber > 0) {
    const parentBlock = await getBlockByNumber(newBlockNumber - 1);
    baseFeeCheck = verifyBaseFeeEIP1559(parentBlock, block);
  }

  const nextBaseFee = nextEIP1559BaseFee(block);

  return {
    block,
    blockNumber: newBlockNumber,
    baseFeeCheck,
    nextBaseFee,
    blockReceipts,
    currentBlock: block,
    currentBlockNumber: newBlockNumber
  };
}

/** JSON-RPC Request Sender */
export async function sendRequest(method, params) {
  const jsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: 2,
  };

  try {
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonRpcRequest),
    });

    if (!response.ok) {
      console.error('RPC Error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Fetch Error:', error.message);
    return null;
  }
}

export function hexToAscii(hex) {
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;

    // Convert to Uint8Array
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    // Decode using TextDecoder
    return new TextDecoder().decode(bytes);
  }

function toBigInt(value) {
  // Handle both decimal and hex strings
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return BigInt(value);
    } else {
      return BigInt(parseInt(value));
    }
  }
  return BigInt(value); // for numbers or already BigInt
}

// Helper: EIP-1559 base fee verification
export function verifyBaseFeeEIP1559(parent, child) {
  if (!parent.baseFeePerGas || !child.baseFeePerGas) {
    return {
      valid: false,
      reason: "Missing base fee (possibly pre-EIP-1559 block?)"
    };
  }

  const parentBaseFee = toBigInt(parent.baseFeePerGas);
  const parentGasUsed = toBigInt(parent.gasUsed);
  const parentGasLimit = toBigInt(parent.gasLimit);
  const childBaseFee = toBigInt(child.baseFeePerGas);

  const targetGas = parentGasLimit / 2n;
  const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8n;

  let expectedBaseFee;

  if (parentGasUsed === targetGas) {
    expectedBaseFee = parentBaseFee;
  } else if (parentGasUsed > targetGas) {
    const gasDelta = parentGasUsed - targetGas;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    if (delta < 1n) delta = 1n; // minimum increase of 1 wei
    expectedBaseFee = parentBaseFee + delta;
  } else {
    const gasDelta = targetGas - parentGasUsed;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    expectedBaseFee = parentBaseFee - delta;
  }

  return {
    valid: expectedBaseFee === childBaseFee,
    expected: expectedBaseFee.toString(),
    actual: childBaseFee.toString(),
    parentBaseFee: parentBaseFee.toString(),
    parentGasUsed: parentGasUsed.toString(),
    parentGasLimit: parentGasLimit.toString(),
    targetGas: targetGas.toString()
  };
}


// EIP-1559 base fee calculation for next block
export function nextEIP1559BaseFee(parent) {
  if (!parent.baseFeePerGas) {
    return {
      valid: false,
      reason: "Missing base fee (possibly pre-EIP-1559 block?)"
    };
  }

  const parentBaseFee = toBigInt(parent.baseFeePerGas);
  const parentGasUsed = toBigInt(parent.gasUsed);
  const parentGasLimit = toBigInt(parent.gasLimit);

  const targetGas = parentGasLimit / 2n;
  const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8n;

  let expectedBaseFee;

  if (parentGasUsed === targetGas) {
    expectedBaseFee = parentBaseFee;
  } else if (parentGasUsed > targetGas) {
    const gasDelta = parentGasUsed - targetGas;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    if (delta < 1n) delta = 1n; // minimum increase of 1 wei
    expectedBaseFee = parentBaseFee + delta;
  } else {
    const gasDelta = targetGas - parentGasUsed;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    expectedBaseFee = parentBaseFee - delta;
  }

  return {
    next: expectedBaseFee.toString()
  };
}



/** Helper: Normalize hex string to 32-byte Uint8Array */
function hexTo32ByteBuffer(hex) {
  const cleaned = hex.replace(/^0x/, '').padStart(64, '0');
  return Uint8Array.from(Buffer.from(cleaned, 'hex'));
}

/**
 * Verify EIP-1559 transaction signature
 * @param {object} txObj
 * @returns {{ recoveredAddress: string, valid: boolean|null, error?: string }}
 */
export function verifyTransactionSignature(txObj) {
  try {
    const toBuf = Buffer.isBuffer(txObj.to)
      ? txObj.to
      : Buffer.from(txObj.to?.replace(/^0x/, '') || '', 'hex');

    const inputBuf = Buffer.isBuffer(txObj.input)
      ? txObj.input
      : Buffer.from(txObj.input?.replace(/^0x/, '') || '', 'hex');

    const rBuf = Buffer.isBuffer(txObj.r)
      ? Uint8Array.from(txObj.r)
      : hexTo32ByteBuffer(txObj.r);

    const sBuf = Buffer.isBuffer(txObj.s)
      ? Uint8Array.from(txObj.s)
      : hexTo32ByteBuffer(txObj.s);

    const unsignedTx = [
      txObj.chainId,
      txObj.nonce,
      BigInt(txObj.maxPriorityFeePerGas),
      BigInt(txObj.maxFeePerGas),
      BigInt(txObj.gas),
      toBuf,
      BigInt(txObj.value),
      inputBuf,
      txObj.accessList || [],
    ];

    const rlpEncoded = rlp.encode(unsignedTx);
    const payload = Buffer.concat([Buffer.from([0x02]), rlpEncoded]);

    const msgHash = Uint8Array.from(new Keccak('keccak256').update(payload).digest());
    const signature = new Uint8Array([...rBuf, ...sBuf]);

    const recovery = parseInt(txObj.yParity);

    const pubKey = secp256k1.ecdsaRecover(signature, recovery, msgHash, false);
    const pubKeyUncompressed = pubKey.slice(1); // remove 0x04 prefix

    const addressBuf = new Keccak('keccak256')
      .update(Buffer.from(pubKeyUncompressed))
      .digest()
      .slice(-20);

    const recoveredAddress = '0x' + Buffer.from(addressBuf).toString('hex');

    const expectedAddress = txObj.from?.toLowerCase();
    const valid = expectedAddress
      ? recoveredAddress.toLowerCase() === expectedAddress
      : null;

    return { recoveredAddress, valid };
  } catch (error) {
    return { error: error.message };
  }
}
