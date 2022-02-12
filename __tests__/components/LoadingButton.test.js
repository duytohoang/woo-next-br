import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingButton from "../../src/components/LoadingButton";

describe('LoadingButton', () => {

    it('Render Button', () => {

        render(
            <LoadingButton
                loading={false}
                handleClick={() => {}}
                label="test label"
                type={'button'}
            />
        );
        screen.getByText("test label");
    });

    it('Render Loading', () => {

        render(
            <LoadingButton
                loading={true}
                handleClick={() => {}}
                label="test label"
                type={'button'}
            />
        );
        screen.getByAltText("Carregando...");
    });

});

