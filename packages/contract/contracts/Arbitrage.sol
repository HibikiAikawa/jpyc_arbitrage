//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

contract Arbitrage is Ownable {
    /**
     * @notice dexのrouterを利用してtokenInからtokenOutにスワップ
     * @param {address} router - dexのrouterアドレス
     * @param {address} _tokenIn - 交換元トークンアドレス
     * @param {address} _tokenOut - 交換先トークンアドレス
     * @param {uint256} _amount - 交換元トークンの交換したいトークン量
     * @dev getAmountOutMinは1に設定している為、レート関係なくトレードされてしまう
     */
    function swap(
        address router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) private {
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint256 deadline = block.timestamp + 300;
        IUniswapV2Router01(router).swapExactTokensForTokens(
            _amount,
            1,
            path,
            address(this),
            deadline
        );
    }

    /**
     * @notice dexのrouterのgetAmountsOutをそのまま叩く
     * @param {address} router - dexのrouterアドレス
     * @param {address} _tokenIn - 交換元トークンアドレス
     * @param {address} _tokenOut - 交換先トークンアドレス
     * @param {uint256} _amount - 交換元トークンアドレスの交換したいトークン量
     * @return {uint256} - 現在のレートで交換された時の貰える交換先トークンの量
     * @dev プールを2つ以上挟んだレートの計算はできない
     */
    function getAmountOutMin(
        address router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) public view returns (uint256) {
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint256[] memory amountOutMins = IUniswapV2Router01(router)
            .getAmountsOut(_amount, path);
        return amountOutMins[path.length - 1];
    }

    /**
     * @notice 2つのdexを介してアビーとラージを行う
     * @param {address} _router1 - 交換元⇒交換先トークンに変換するルーターアドレス
     * @param {address} _router2 - 交換先⇒交換元トークンに変換するルーターアドレス
     * @param {address} _token1 - 交換元トークンアドレス
     * @param {address} _token2 - 交換先トークンアドレス
     * @param {uint256} _amount - 交換元トークンの交換したいトークン量
     * @dev require関数でアービトラージで利益が出ているかを担保する
     */
    function dualDexTrade(
        address _router1,
        address _router2,
        address _token1,
        address _token2,
        uint256 _amount
    ) external onlyOwner {
        uint256 startBalance = IERC20(_token1).balanceOf(address(this));
        uint256 token2InitialBalance = IERC20(_token2).balanceOf(address(this));
        swap(_router1, _token1, _token2, _amount);
        uint256 token2Balance = IERC20(_token2).balanceOf(address(this));
        uint256 tradeableAmount = token2Balance - token2InitialBalance;
        swap(_router2, _token2, _token1, tradeableAmount);
        uint256 endBalance = IERC20(_token1).balanceOf(address(this));
        require(endBalance > startBalance, "Trade Reverted, No Profit Made");
    }

    /**
     * @notice このコントラクトが所持しているトークン量を確認
     * @param {address} _tokenContractAddress - 確認したいトークンのアドレス
     * @return {uint256} トークン残高
     */
    function getBalance(address _tokenContractAddress)
        external
        view
        returns (uint256)
    {
        uint256 balance = IERC20(_tokenContractAddress).balanceOf(
            address(this)
        );
        return balance;
    }

    /**
     * @notice このコントラクトがDEXルーターにapproveする関数
     * @param {address} token - 承認するトークンのアドレス
     * @param {address} spender - DEXルーターのアドレス
     * @param {uint256} amount - 取り扱いを許可するトークン量
     */
    function approve(
        address token,
        address spender,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).approve(spender, amount);
    }

    /**
     * @notice コントラクトアドレスのトークンをウォレットアドレスに送る
     * @param {address} tokenAddress - 送るトークンのアドレス
     */
    function recoverTokens(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
