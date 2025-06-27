'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
}

export function PortfolioDashboard() {
  const { account, cluster } = useWalletUi()
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const fetchPortfolioData = useCallback(async () => {
    if (!account) return

    setIsLoading(true)
    setError('') // Clear previous errors
    try {
      const mockData = {
        balance: 2500000000,
        tokens: [
          { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', amount: '1000000', decimals: 6, symbol: 'USDC' },
          { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', amount: '500000000', decimals: 6, symbol: 'USDT' },
        ],
      }

      // Use setPortfolio with a new object, not mutation
      setPortfolio({
        balance: mockData.balance / 1000000, // Convert lamports to SOL
        tokens: mockData.tokens,
        totalValue: calculateTotalValueFromTokens(mockData.tokens),
      })
    } catch {
      setError('Error fetching portfolio data')
    }
    setIsLoading(false)
  }, [account])

  useEffect(() => {
    if (account) {
      fetchPortfolioData()
    }
  }, [account, fetchPortfolioData])

  // Util to calculate total value from tokens (mock: just sum amounts, real: use price API)
  const calculateTotalValueFromTokens = (tokens: TokenInfo[]) => {
    // For mock, just sum USDC and USDT as $1 per token
    return tokens.reduce((total, token) => {
      const amount = parseFloat(token.amount) / Math.pow(10, token.decimals)
      return total + amount
    }, 0)
  }

  const calculateTotalValue = () => {
    // Use portfolio.tokens and sum as $1 per token (mock)
    return calculateTotalValueFromTokens(portfolio.tokens)
  }

  const formatBalance = (balance: number) => {
    return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (!account) {
    return (
      <div className="p-2">
        <h1 className="text-6xl font-bold mb-2 whitespace-nowrap overflow-hidden">
          Portfolio Dashboard - Please Connect Wallet
        </h1>
        <div className="bg-yellow-200 p-8 rounded border-4 border-yellow-500">
          <p className="text-2xl font-bold whitespace-nowrap">
            ⚠️ WALLET CONNECTION REQUIRED - Please connect your Solana wallet to view your cryptocurrency portfolio
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 max-w-none overflow-x-hidden">
      <h1 className="text-5xl font-bold mb-2 break-words overflow-visible">
        My Portfolio Dashboard for Cryptocurrency Assets
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs">{error}</div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-2 overflow-x-auto min-w-0 w-full">
        <Card className="w-full sm:min-w-80 sm:w-auto flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-xl whitespace-nowrap">SOL Balance Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-lg">Loading your balance...</div>
            ) : (
              <div>
                <p className="text-4xl font-bold whitespace-nowrap">{formatBalance(portfolio.balance)} SOL</p>
                <p className="text-base text-gray-500 whitespace-nowrap">Current Network: {cluster.label}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full sm:min-w-96 sm:w-auto flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-xl whitespace-nowrap">Token Holdings & Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.tokens.length === 0 ? (
              <p className="text-lg">No tokens found in wallet</p>
            ) : (
              <div className="space-y-3">
                {portfolio.tokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2"
                  >
                    <div>
                      <span className="text-lg font-medium">{token.symbol || 'Unknown Token'}</span>
                      <p className="text-sm text-gray-600 font-mono break-all">{token.mint}</p>
                    </div>
                    <span className="text-lg font-mono whitespace-nowrap mt-2 sm:mt-0">{token.amount} tokens</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full sm:min-w-72 sm:w-auto flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-xl whitespace-nowrap">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold whitespace-nowrap">${calculateTotalValue().toFixed(2)} USD</p>
            <Button
              onClick={fetchPortfolioData}
              disabled={isLoading}
              className="mt-6 w-full text-lg py-4 px-8 whitespace-nowrap"
            >
              Refresh Portfolio Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
