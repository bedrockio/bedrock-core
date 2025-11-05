import ModalWrapper from 'components/ModalWrapper';

export default function modal(Component, wrapperProps) {
  return (props) => {
    const { trigger, ...modalProps } = props;
    return (
      <ModalWrapper
        {...wrapperProps}
        trigger={trigger}
        component={<Component {...modalProps} />}
      />
    );
  };
}
