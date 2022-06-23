//SPDX-License-Identifier: Unlicense
pragma solidity =0.5.16;

interface IERC20 {
    function balanceOf(address owner) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
}

interface IRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint256 amountIn,address[] calldata path) external view returns (uint256[] memory amounts);

}


contract Arbitrage {

    function arbitrage(
        uint amountIn,
        address to,
        uint deadline,
        address[] memory inPath,
        address[] memory outPath,
        address tokenAddress,
        address inRouter,
        address outRouter,
        uint amountOutMin
    ) public {
        uint initialBalance = IERC20(tokenAddress).balanceOf(msg.sender);
        IRouter(inRouter).swapExactTokensForTokens(amountIn, 1, inPath, to, deadline);
        uint balance = IERC20(tokenAddress).balanceOf(msg.sender);
        uint tradeableAmount = balance - initialBalance;
        IRouter(outRouter).swapExactTokensForTokens(tradeableAmount, amountOutMin, outPath, to, deadline);
    }

    function swap(
        uint amountIn,
        address to,
        uint deadline,
        address[] memory path,
        address router,
        uint amountOutMin
    ) public {
		IERC20(path[0]).approve(router, amountIn);
        IRouter(router).swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
    }

    function getAmount(
        uint256 amountIn,
        address[] memory path,
        address router
    ) public view returns (uint256[] memory){
        uint256[] memory amounts = IRouter(router).getAmountsOut(amountIn, path);
        return amounts;
    }
}